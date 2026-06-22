using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.BookingServices.Commands;
using CRMService.Application.Features.BookingServices.DTOs;
using CRMService.Application.Features.BookingServices.Filters;
using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Application.Features.BookingServices.Responses;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Scheduling.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;
using System.Collections.Concurrent;

namespace CRMService.Application.Features.BookingServices.Services
{
    public class BookingService : IBookingService
    {
        // In-memory attempt tracker: bookingId → failed attempts count
        // Acceptable for dev/MVP — resets on server restart, which is fine for a 5-min TTL window
        private static readonly ConcurrentDictionary<Guid, int> _verifyAttempts = new();

        private readonly IBookingRepository _bookingRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IServiceRepository _serviceRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly ISalonRepository _salonRepo;
        private readonly ISmsService _smsService;
        private readonly IAvailableSlotsService _slotsService;

        // ✓ Видалено: ISmsVerificationRepository, ICodeHasher — не потрібні з Twilio Verify

        public BookingService(
            IBookingRepository bookingRepo,
            IClientRepository clientRepo,
            IServiceRepository serviceRepo,
            IEmployeeRepository employeeRepo,
            ISalonRepository salonRepo,
            ISmsService smsService,
            IAvailableSlotsService slotsService)
        {
            _bookingRepo = bookingRepo;
            _clientRepo = clientRepo;
            _serviceRepo = serviceRepo;
            _employeeRepo = employeeRepo;
            _salonRepo = salonRepo;
            _smsService = smsService;
            _slotsService = slotsService;
        }

        public async Task<CreateBookingResponse> CreateAsync(CreateBookingCommand command)
        {
            // 1. Валідація салону
            var salon = await _salonRepo.GetByIdAsync(command.SalonId)
                ?? throw new KeyNotFoundException("Salon not found.");

            // 2. Валідація послуги
            var service = await _serviceRepo.GetByIdAsync(command.ServiceId)
                ?? throw new KeyNotFoundException("Service not found.");
            service.EnsureBelongsToSalon(command.SalonId);

            if (!service.IsActive)
                throw new InvalidOperationException("Service is not active.");

            // 3. Валідація майстра
            var employee = await _employeeRepo.GetByIdWithServicesAsync(command.EmployeeId)
                ?? throw new KeyNotFoundException("Employee not found.");
            employee.EnsureBelongsToSalon(command.SalonId);

            if (!employee.IsActive)
                throw new InvalidOperationException("Employee is not active.");

            var employeeService = employee.Services.FirstOrDefault(s => s.ServiceId == command.ServiceId)
                ?? throw new InvalidOperationException("Employee does not provide this service.");

            // 4. Розраховуємо EndTime на основі SystemDuration
            var endTimeUtc = command.StartTimeUtc.AddMinutes(service.SystemDurationMinutes);

            // 5. Перевіряємо що слот не зайнятий
            var isSlotTaken = await _bookingRepo.IsSlotTakenAsync(
                command.EmployeeId, command.StartTimeUtc, endTimeUtc);

            if (isSlotTaken)
                throw new InvalidOperationException("This time slot is no longer available.");

            // 6. Знаходимо або створюємо клієнта
            var client = await _clientRepo.GetByPhoneAndSalonAsync(command.ClientPhone, command.SalonId);
            if (client is null)
            {
                client = new Client(
                    command.SalonId,
                    command.ClientPhone,
                    command.ClientFirstName,
                    command.ClientLastName);
                await _clientRepo.AddAsync(client);
            }
            else if (!string.IsNullOrWhiteSpace(command.ClientFirstName))
            {
                client.UpdateName(command.ClientFirstName, command.ClientLastName);
                await _clientRepo.UpdateAsync(client);
            }

            // 7. Ціна на момент бронювання
            var price = employeeService.PriceOverride ?? service.Price;

            // 8. Створюємо бронювання
            var booking = new Booking(
                command.SalonId,
                client.Id,
                command.EmployeeId,
                command.ServiceId,
                command.StartTimeUtc,
                endTimeUtc,
                price);

            await _bookingRepo.AddAsync(booking);

            // 9. Надсилаємо SMS з кодом підтвердження
            await _smsService.SendVerificationCodeAsync(client.Phone);

            // 10. Інвалідуємо кеш слотів
            var date = DateOnly.FromDateTime(command.StartTimeUtc);
            await _slotsService.InvalidateCacheAsync(command.SalonId, command.ServiceId, date);

            return new CreateBookingResponse
            {
                BookingId = booking.Id,
                Status = booking.Status,
                ExpiresAt = booking.ExpiresAt,
                Message = "SMS code sent.",
                AttemptsAllowed = 3
            };
        }

        public async Task<VerifyCodeResponse> VerifyCodeAsync(Guid bookingId, string code)
        {
            const int maxAttempts = 3;

            var booking = await _bookingRepo.GetByIdWithDetailsAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            // 1. Перевірка статусу
            if (booking.Status != BookingStatus.Pending)
            {
                _verifyAttempts.TryRemove(bookingId, out _);
                return new VerifyCodeResponse
                {
                    BookingId = bookingId,
                    Status = booking.Status,
                    Success = false,
                    AttemptsLeft = 0,
                    Message = "Бронювання вже не очікує підтвердження."
                };
            }

            // 2. Перевірка TTL
            if (booking.IsExpired)
            {
                booking.ExpirePending();
                await _bookingRepo.UpdateAsync(booking);
                _verifyAttempts.TryRemove(bookingId, out _);
                return new VerifyCodeResponse
                {
                    BookingId = bookingId,
                    Status = booking.Status,
                    Success = false,
                    AttemptsLeft = 0,
                    Message = "Час очікування вичерпано. Будь ласка, зробіть запис заново."
                };
            }

            // 3. Перевірка кількості спроб
            var attempts = _verifyAttempts.GetOrAdd(bookingId, 0);
            if (attempts >= maxAttempts)
            {
                booking.ExpirePending();
                await _bookingRepo.UpdateAsync(booking);
                _verifyAttempts.TryRemove(bookingId, out _);
                return new VerifyCodeResponse
                {
                    BookingId = bookingId,
                    Status = booking.Status,
                    Success = false,
                    AttemptsLeft = 0,
                    Message = "Вичерпано всі спроби. Будь ласка, зробіть запис заново."
                };
            }

            // 4. Перевірка коду
            var isValid = await _smsService.CheckVerificationCodeAsync(booking.Client.Phone, code);

            if (!isValid)
            {
                var newAttempts = _verifyAttempts.AddOrUpdate(bookingId, 1, (_, old) => old + 1);
                var attemptsLeft = maxAttempts - newAttempts;

                if (attemptsLeft <= 0)
                {
                    booking.ExpirePending();
                    await _bookingRepo.UpdateAsync(booking);
                    _verifyAttempts.TryRemove(bookingId, out _);
                    return new VerifyCodeResponse
                    {
                        BookingId = bookingId,
                        Status = booking.Status,
                        Success = false,
                        AttemptsLeft = 0,
                        Message = "Вичерпано всі спроби. Будь ласка, зробіть запис заново."
                    };
                }

                return new VerifyCodeResponse
                {
                    BookingId = bookingId,
                    Status = booking.Status,
                    Success = false,
                    AttemptsLeft = attemptsLeft,
                    Message = $"Невірний код. Залишилось спроб: {attemptsLeft}."
                };
            }

            // 5. Код правильний — підтверджуємо бронювання
            booking.Confirm();
            await _bookingRepo.UpdateAsync(booking);
            _verifyAttempts.TryRemove(bookingId, out _);

            var client = await _clientRepo.GetByIdAsync(booking.ClientId);
            client?.RecordVisit();
            if (client is not null)
                await _clientRepo.UpdateAsync(client);

            return new VerifyCodeResponse
            {
                BookingId = bookingId,
                Status = booking.Status,
                Success = true,
                AttemptsLeft = 0,
                Message = "Запис підтверджено!"
            };
        }

        public async Task CancelAsync(Guid bookingId, string reason, Guid requesterId)
        {
            var booking = await _bookingRepo.GetByIdAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            booking.Cancel(reason);
            await _bookingRepo.UpdateAsync(booking);

            var date = DateOnly.FromDateTime(booking.StartTimeUtc);
            await _slotsService.InvalidateCacheAsync(booking.SalonId, booking.ServiceId, date);
        }

        public async Task CompleteAsync(Guid bookingId, Guid employeeId)
        {
            var booking = await _bookingRepo.GetByIdAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.EmployeeId != employeeId)
                throw new UnauthorizedAccessException("You can only complete your own bookings.");

            booking.Complete();
            await _bookingRepo.UpdateAsync(booking);

            var client = await _clientRepo.GetByIdAsync(booking.ClientId);
            client?.RecordVisit();
            if (client is not null)
                await _clientRepo.UpdateAsync(client);
        }

        public async Task<BookingDto> GetByIdAsync(Guid bookingId)
        {
            var booking = await _bookingRepo.GetByIdWithDetailsAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");
            return MapToDto(booking);
        }

        public async Task<List<BookingListItemDto>> GetBySalonAsync(
            Guid salonId, Guid ownerId, BookingFilterDto filter)
        {
            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);

            var bookings = await _bookingRepo.GetBySalonAsync(salonId, filter);
            return bookings.Select(MapToListItemDto).ToList();
        }

        // ── Mappers ────────────────────────────────────────────────

        private static BookingDto MapToDto(Booking b) => new()
        {
            Id = b.Id,
            SalonId = b.SalonId,
            Status = b.Status,
            StartTimeUtc = b.StartTimeUtc,
            EndTimeUtc = b.EndTimeUtc,
            Price = b.Price,
            ExpiresAt = b.ExpiresAt,
            CancellationReason = b.CancellationReason,
            CreatedAt = b.CreatedAt,
            Client = new ClientShortDto
            {
                Id = b.Client.Id,
                Phone = b.Client.Phone,
                FullName = b.Client.FullName,
                NoShowCount = b.Client.NoShowCount
            },
            Employee = new EmployeeShortDto
            {
                Id = b.Employee.Id,
                FullName = b.Employee.FullName,
                AvatarUrl = b.Employee.AvatarUrl
            },
            Service = new ServiceShortDto
            {
                Id = b.Service.Id,
                Name = b.Service.Name,
                ClientDurationMinutes = b.Service.ClientDurationMinutes
            },
            FieldAnswers = b.FieldAnswers.Select(a => new BookingFieldAnswerDto
            {
                BookingFieldId = a.BookingFieldId,
                Label = a.Field?.Label ?? string.Empty,
                Type = a.Field?.Type.ToString() ?? string.Empty,
                TextValue = a.TextValue,
                FileUrl = a.FileUrl
            }).ToList()
        };

        public async Task<BookingDto> CreateByAdminAsync(
            CreateAdminBookingCommand command,
            Guid salonId,
            Guid ownerId)
        {
            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);

            var service = await _serviceRepo.GetByIdAsync(command.ServiceId)
                ?? throw new KeyNotFoundException("Service not found.");
            service.EnsureBelongsToSalon(salonId);

            if (!service.IsActive)
                throw new InvalidOperationException("Service is not active.");

            var employee = await _employeeRepo.GetByIdWithServicesAsync(command.EmployeeId)
                ?? throw new KeyNotFoundException("Employee not found.");
            employee.EnsureBelongsToSalon(salonId);

            if (!employee.IsActive)
                throw new InvalidOperationException("Employee is not active.");

            var employeeService = employee.Services
                .FirstOrDefault(s => s.ServiceId == command.ServiceId)
                ?? throw new InvalidOperationException("Employee does not provide this service.");

            var endTimeUtc = command.StartTimeUtc.AddMinutes(service.SystemDurationMinutes);

            var isSlotTaken = await _bookingRepo.IsSlotTakenAsync(
                command.EmployeeId, command.StartTimeUtc, endTimeUtc);

            if (isSlotTaken)
                throw new InvalidOperationException("This time slot is already booked.");

            var client = await _clientRepo.GetByPhoneAndSalonAsync(command.ClientPhone, salonId);
            if (client is null)
            {
                client = new Client(salonId, command.ClientPhone,
                    command.ClientFirstName, command.ClientLastName);
                await _clientRepo.AddAsync(client);
            }
            else if (!string.IsNullOrWhiteSpace(command.ClientFirstName))
            {
                client.UpdateName(command.ClientFirstName, command.ClientLastName);
                await _clientRepo.UpdateAsync(client);
            }

            var price = employeeService.PriceOverride ?? service.Price;

            // ✓ Одразу Confirmed — без SMS
            var booking = Booking.CreateByAdmin(
                salonId, client.Id, command.EmployeeId,
                command.ServiceId, command.StartTimeUtc, endTimeUtc, price);

            await _bookingRepo.AddAsync(booking);

            var date = DateOnly.FromDateTime(command.StartTimeUtc);
            await _slotsService.InvalidateCacheAsync(salonId, command.ServiceId, date);

            var saved = await _bookingRepo.GetByIdWithDetailsAsync(booking.Id)
                ?? throw new InvalidOperationException("Booking not found after save.");

            return MapToDto(saved);
        }

        // ── Master cabinet ────────────────────────────────────────────────────

        public async Task<List<MasterBookingDto>> GetMyBookingsAsync(
            Guid salonId, Guid userId,
            DateOnly? date, DateOnly? dateFrom, DateOnly? dateTo)
        {
            var employee = await _employeeRepo.GetByUserIdAsync(userId, salonId)
                ?? throw new UnauthorizedAccessException("Not an employee of this salon.");

            var filter = new BookingFilterDto
            {
                EmployeeId = employee.Id,
                Date       = date,
                DateFrom   = dateFrom,
                DateTo     = dateTo,
            };

            var bookings = await _bookingRepo.GetBySalonAsync(salonId, filter);
            return bookings.Select(MapToMasterBookingDto).ToList();
        }

        public async Task CompleteByEmployeeAsync(Guid bookingId, Guid userId)
        {
            var booking = await _bookingRepo.GetByIdAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            var employee = await _employeeRepo.GetByUserIdAsync(userId, booking.SalonId)
                ?? throw new UnauthorizedAccessException("Not an employee of this salon.");

            if (booking.EmployeeId != employee.Id)
                throw new UnauthorizedAccessException("You can only complete your own bookings.");

            booking.Complete();
            await _bookingRepo.UpdateAsync(booking);

            var client = await _clientRepo.GetByIdAsync(booking.ClientId);
            client?.RecordVisit();
            if (client is not null)
                await _clientRepo.UpdateAsync(client);
        }

        private static MasterBookingDto MapToMasterBookingDto(Booking b) => new()
        {
            Id                    = b.Id,
            Status                = b.Status,
            StartTimeUtc          = b.StartTimeUtc,
            EndTimeUtc            = b.EndTimeUtc,
            StartTimeLocal        = b.StartTimeUtc.ToLocalTime().ToString("HH:mm"),
            EndTimeLocal          = b.EndTimeUtc.ToLocalTime().ToString("HH:mm"),
            ClientName            = b.Client?.FullName ?? string.Empty,
            ClientPhone           = b.Client?.Phone ?? string.Empty,
            ClientNoShowCount     = b.Client?.NoShowCount ?? 0,
            ServiceName           = b.Service?.Name ?? string.Empty,
            ClientDurationMinutes = b.Service?.ClientDurationMinutes ?? 0,
            Price                 = b.Price,
            FieldAnswers          = b.FieldAnswers.Select(a => new BookingFieldAnswerDto
            {
                BookingFieldId = a.BookingFieldId,
                Label          = a.Field?.Label ?? string.Empty,
                Type           = a.Field?.Type.ToString() ?? string.Empty,
                TextValue      = a.TextValue,
                FileUrl        = a.FileUrl,
            }).ToList(),
        };

        private static BookingListItemDto MapToListItemDto(Booking b) => new()
        {
            Id = b.Id,
            Status = b.Status,
            StartTimeUtc = b.StartTimeUtc,
            EndTimeUtc = b.EndTimeUtc,
            Price = b.Price,
            ClientPhone = b.Client?.Phone ?? string.Empty,
            ClientName = b.Client?.FullName ?? string.Empty,
            EmployeeId = b.Employee?.Id ?? Guid.Empty,
            EmployeeName = b.Employee?.FullName ?? string.Empty,
            ServiceName = b.Service?.Name ?? string.Empty
        };

        // ── Client self-service ────────────────────────────────────────────

        public async Task RequestClientCodeAsync(string phone)
        {
            await _smsService.SendVerificationCodeAsync(phone);
        }

        public async Task<List<BookingListItemDto>> GetClientHistoryAsync(
            Guid salonId, string phone, string code)
        {
            var isValid = await _smsService.CheckVerificationCodeAsync(phone, code);
            if (!isValid)
                throw new UnauthorizedAccessException("Невірний код підтвердження.");

            var bookings = await _bookingRepo.GetByClientPhoneAsync(salonId, phone);
            return bookings.Select(MapToListItemDto).ToList();
        }

        public async Task CancelByClientAsync(Guid bookingId, string phone, string code)
        {
            var isValid = await _smsService.CheckVerificationCodeAsync(phone, code);
            if (!isValid)
                throw new UnauthorizedAccessException("Невірний код підтвердження.");

            var booking = await _bookingRepo.GetByIdWithDetailsAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.Client?.Phone != phone)
                throw new UnauthorizedAccessException("Цей запис не належить вашому номеру.");

            if (booking.Status != BookingStatus.Confirmed)
                throw new InvalidOperationException("Можна скасувати лише підтверджені записи.");

            booking.Cancel("Скасовано клієнтом");
            await _bookingRepo.UpdateAsync(booking);

            var date = DateOnly.FromDateTime(booking.StartTimeUtc);
            await _slotsService.InvalidateCacheAsync(booking.SalonId, booking.ServiceId, date);
        }
    }
}