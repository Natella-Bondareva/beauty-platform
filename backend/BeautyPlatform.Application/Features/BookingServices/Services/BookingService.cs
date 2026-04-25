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

namespace CRMService.Application.Features.BookingServices.Services
{
    public class BookingService : IBookingService
    {
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

            // 9. Twilio Verify сам генерує і відправляє SMS код
            await _smsService.SendVerificationCodeAsync(client.Phone);

            // 10. Інвалідуємо кеш слотів
            var date = DateOnly.FromDateTime(command.StartTimeUtc);
            await _slotsService.InvalidateCacheAsync(command.SalonId, command.ServiceId, date);

            return new CreateBookingResponse
            {
                BookingId = booking.Id,
                Status = booking.Status,
                ExpiresAt = booking.ExpiresAt,
                Message = "We sent you an SMS with verification code.",
                AttemptsAllowed = 3 // Twilio Verify дозволяє 3 спроби за замовчуванням
            };
        }

        public async Task<VerifyCodeResponse> VerifyCodeAsync(Guid bookingId, string code)
        {
            var booking = await _bookingRepo.GetByIdWithDetailsAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            // 1. Перевірка TTL
            if (booking.IsExpired)
            {
                booking.ExpirePending();
                await _bookingRepo.UpdateAsync(booking);

                return new VerifyCodeResponse
                {
                    BookingId = bookingId,
                    Status = booking.Status,
                    Success = false,
                    AttemptsLeft = 0,
                    Message = "Booking has expired. Please create a new booking."
                };
            }

            // 2. Перевірка статусу
            if (booking.Status != BookingStatus.Pending)
            {
                return new VerifyCodeResponse
                {
                    BookingId = bookingId,
                    Status = booking.Status,
                    Success = false,
                    AttemptsLeft = 0,
                    Message = "Booking is no longer pending."
                };
            }

            // 3. ✓ Використовуємо booking.Client.Phone — client береться з навігаційної властивості
            bool isValid;
            try
            {
                isValid = await _smsService.CheckVerificationCodeAsync(booking.Client.Phone, code);
            }
            catch (Exception ex)
            {
                return new VerifyCodeResponse
                {
                    BookingId = bookingId,
                    Status = booking.Status,
                    Success = false,
                    AttemptsLeft = 0,
                    Message = ex.Message
                };
            }

            // 4. Невірний код — Twilio сам рахує спроби, ми не маємо точної цифри
            if (!isValid)
            {
                return new VerifyCodeResponse
                {
                    BookingId = bookingId,
                    Status = booking.Status,
                    Success = false,
                    AttemptsLeft = 2, // Twilio не повертає залишок спроб напряму
                    Message = "Invalid verification code. Please try again."
                };
            }

            // 5. Код правильний — підтверджуємо бронювання
            booking.Confirm();
            await _bookingRepo.UpdateAsync(booking);

            // 6. Оновлюємо клієнта
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
                Message = "Booking confirmed successfully!"
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
            }
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
            EmployeeName = b.Employee?.FullName ?? string.Empty,
            ServiceName = b.Service?.Name ?? string.Empty
        };
    }
}