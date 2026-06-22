using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Scheduling.DTOs;
using CRMService.Application.Features.Scheduling.Interfaces;
using CRMService.Application.Features.Scheduling.Queries;
using CRMService.Domain.Entities;

namespace CRMService.Application.Features.Scheduling.Services
{
    public class AvailableSlotsService : IAvailableSlotsService
    {
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IEmployeeBreakRepository _breakRepo;
        private readonly IServiceRepository _serviceRepo;
        private readonly ISalonRepository _salonRepo;
        private readonly IBookingRepository _bookingRepo;
        private readonly ISlotCacheService _cache;

        private const int SlotStepMinutes = 15;
        private static readonly TimeSpan CacheTtl = TimeSpan.FromMinutes(15);

        public AvailableSlotsService(
            IEmployeeRepository employeeRepo,
            IEmployeeBreakRepository breakRepo,
            IServiceRepository serviceRepo,
            ISalonRepository salonRepo,
            IBookingRepository bookingRepo,
            ISlotCacheService cache)
        {
            _employeeRepo = employeeRepo;
            _breakRepo = breakRepo;
            _serviceRepo = serviceRepo;
            _salonRepo = salonRepo;
            _bookingRepo = bookingRepo;
            _cache = cache;
        }

        // ── Сценарій 1 ─────────────────────────────────────────────

        public async Task<List<AvailableSlotDto>> GetAllAvailableSlotsAsync(GetAvailableSlotsQuery query)
        {
            var cacheKey = ISlotCacheService.BuildKey(query.SalonId, query.ServiceId, query.Date);

            var cached = await _cache.GetAsync(cacheKey);
            if (cached is not null)
                return cached;

            var salon = await _salonRepo.GetByIdAsync(query.SalonId)
                ?? throw new KeyNotFoundException("Salon not found.");

            var service = await _serviceRepo.GetByIdAsync(query.ServiceId)
                ?? throw new KeyNotFoundException("Service not found.");

            var employees = await _employeeRepo.GetActiveByServiceIdAsync(query.ServiceId, query.SalonId);

            var employeeIds = employees.Select(e => e.Id).ToList();

            // Два batch-запити замість 2×N послідовних:
            // N майстрів → було: 2N+3 запити, стало: 5 запитів незалежно від кількості майстрів.
            // Task.WhenAll тут не можна — обидва репозиторії ділять один scoped DbContext,
            // який не підтримує паралельних операцій.
            var allBookings = await _bookingRepo.GetByEmployeesAndDateAsync(employeeIds, query.Date);
            var allBreaks   = await _breakRepo.GetByEmployeesAndDateAsync(employeeIds, query.Date);

            var bookingsByEmployee = allBookings
                .GroupBy(b => b.EmployeeId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var breaksByEmployee = allBreaks
                .GroupBy(b => b.EmployeeId)
                .ToDictionary(g => g.Key, g => g.ToList());

            var result = new List<AvailableSlotDto>();

            foreach (var employee in employees)
            {
                var employeeService = employee.Services
                    .FirstOrDefault(s => s.ServiceId == query.ServiceId);

                var effectiveSystemDuration = employeeService?.GetEffectiveSystemDuration()
                    ?? service.SystemDurationMinutes;
                var effectiveClientDuration = employeeService?.GetEffectiveClientDuration()
                    ?? service.ClientDurationMinutes;
                var effectivePrice = employeeService?.GetEffectivePrice()
                    ?? service.Price;

                var slots = CalculateSlotsForEmployee(
                    employee,
                    effectiveSystemDuration,
                    query.Date,
                    salon.Settings.Timezone,
                    salon.Settings.OpeningTime,
                    salon.Settings.ClosingTime,
                    bookingsByEmployee.GetValueOrDefault(employee.Id) ?? [],
                    breaksByEmployee.GetValueOrDefault(employee.Id) ?? []);

                result.AddRange(slots.Select(s => new AvailableSlotDto
                {
                    EmployeeId = employee.Id,
                    EmployeeName = employee.FullName,
                    EmployeeAvatarUrl = employee.AvatarUrl,
                    StartTimeUtc = s.StartUtc,
                    EndTimeUtc = s.EndUtc,
                    StartTimeLocal = s.StartLocal,
                    EndTimeLocal = s.EndLocal,
                    Price = effectivePrice,
                    ClientDurationMinutes = effectiveClientDuration
                }));
            }

            result = result.OrderBy(s => s.StartTimeUtc).ToList();
            await _cache.SetAsync(cacheKey, result, CacheTtl);
            return result;
        }

        // ── Сценарій 2 ─────────────────────────────────────────────

        public async Task<EmployeeAvailabilityDto?> GetEmployeeAllSlotsAsync(GetEmployeeAllSlotsQuery query)
        {
            var salon = await _salonRepo.GetByIdAsync(query.SalonId)
                ?? throw new KeyNotFoundException("Salon not found.");

            var employee = await _employeeRepo.GetByIdWithServicesAsync(query.EmployeeId)
                ?? throw new KeyNotFoundException("Employee not found.");

            employee.EnsureBelongsToSalon(query.SalonId);

            if (!employee.IsActive)
                return null;

            var allSlots = new List<SlotTimeDto>();

            foreach (var employeeService in employee.Services)
            {
                var service = await _serviceRepo.GetByIdAsync(employeeService.ServiceId);
                if (service is null || !service.IsActive) continue;

                // ✓ ефективна тривалість + години салону
                var effectiveSystemDuration = employeeService.GetEffectiveSystemDuration();

                var slots = await CalculateSlotsForEmployeeAsync(
                    employee,
                    effectiveSystemDuration,
                    query.Date,
                    salon.Settings.Timezone,
                    salon.Settings.OpeningTime,
                    salon.Settings.ClosingTime);

                allSlots.AddRange(slots.Select(s => new SlotTimeDto
                {
                    StartTimeUtc = s.StartUtc,
                    EndTimeUtc = s.EndUtc,
                    StartTimeLocal = s.StartLocal,
                    EndTimeLocal = s.EndLocal
                }));
            }

            var uniqueSlots = allSlots
                .DistinctBy(s => s.StartTimeUtc)
                .OrderBy(s => s.StartTimeUtc)
                .ToList();

            return new EmployeeAvailabilityDto
            {
                EmployeeId = employee.Id,
                EmployeeName = employee.FullName,
                AvatarUrl = employee.AvatarUrl,
                Price = 0,
                Slots = uniqueSlots
            };
        }

        // ── Сценарій 3 ─────────────────────────────────────────────

        public async Task<EmployeeAvailabilityDto?> GetEmployeeAvailableSlotsAsync(GetEmployeeAvailableSlotsQuery query)
        {
            var salon = await _salonRepo.GetByIdAsync(query.SalonId)
                ?? throw new KeyNotFoundException("Salon not found.");

            var service = await _serviceRepo.GetByIdAsync(query.ServiceId)
                ?? throw new KeyNotFoundException("Service not found.");

            var employee = await _employeeRepo.GetByIdWithServicesAsync(query.EmployeeId)
                ?? throw new KeyNotFoundException("Employee not found.");

            employee.EnsureBelongsToSalon(query.SalonId);

            var employeeService = employee.Services.FirstOrDefault(s => s.ServiceId == query.ServiceId);
            if (employeeService is null)
                return null;

            // ✓ ефективні значення через методи entity
            var effectiveSystemDuration = employeeService.GetEffectiveSystemDuration();
            var effectiveClientDuration = employeeService.GetEffectiveClientDuration();
            var price = employeeService.GetEffectivePrice();

            // ✓ передаємо години салону
            var slots = await CalculateSlotsForEmployeeAsync(
                employee,
                effectiveSystemDuration,
                query.Date,
                salon.Settings.Timezone,
                salon.Settings.OpeningTime,
                salon.Settings.ClosingTime);

            return new EmployeeAvailabilityDto
            {
                EmployeeId = employee.Id,
                EmployeeName = employee.FullName,
                AvatarUrl = employee.AvatarUrl,
                Price = price,
                Slots = slots.Select(s => new SlotTimeDto
                {
                    StartTimeUtc = s.StartUtc,
                    EndTimeUtc = s.EndUtc,
                    StartTimeLocal = s.StartLocal,
                    EndTimeLocal = s.EndLocal
                }).ToList()
            };
        }

        // ── Сценарій 4: найближчий слот кожного майстра ───────────

        public async Task<List<NearestSlotDto>> GetNearestSlotsAsync(GetNearestSlotsQuery query)
        {
            var salon = await _salonRepo.GetByIdAsync(query.SalonId)
                ?? throw new KeyNotFoundException("Salon not found.");

            var service = await _serviceRepo.GetByIdAsync(query.ServiceId)
                ?? throw new KeyNotFoundException("Service not found.");

            var employees = await _employeeRepo.GetActiveByServiceIdAsync(query.ServiceId, query.SalonId);

            var today = DateOnly.FromDateTime(DateTime.UtcNow);
            var result = new List<NearestSlotDto>();

            foreach (var employee in employees)
            {
                var employeeService = employee.Services
                    .FirstOrDefault(s => s.ServiceId == query.ServiceId);

                var effectiveSystemDuration = employeeService?.GetEffectiveSystemDuration()
                    ?? service.SystemDurationMinutes;
                var effectiveClientDuration = employeeService?.GetEffectiveClientDuration()
                    ?? service.ClientDurationMinutes;
                var effectivePrice = employeeService?.GetEffectivePrice()
                    ?? service.Price;

                // Сканування по днях — зупиняємось на першому доступному слоті
                for (int day = 0; day < query.HorizonDays; day++)
                {
                    var date = today.AddDays(day);

                    var slots = await CalculateSlotsForEmployeeAsync(
                        employee,
                        effectiveSystemDuration,
                        date,
                        salon.Settings.Timezone,
                        salon.Settings.OpeningTime,
                        salon.Settings.ClosingTime);

                    if (slots.Count == 0)
                        continue;

                    var first = slots[0];
                    result.Add(new NearestSlotDto
                    {
                        EmployeeId          = employee.Id,
                        EmployeeName        = employee.FullName,
                        EmployeeAvatarUrl   = employee.AvatarUrl,
                        Date                = date,
                        StartTimeUtc        = first.StartUtc,
                        EndTimeUtc          = first.EndUtc,
                        StartTimeLocal      = first.StartLocal,
                        EndTimeLocal        = first.EndLocal,
                        Price               = effectivePrice,
                        ClientDurationMinutes = effectiveClientDuration,
                    });
                    break;
                }
            }

            return result.OrderBy(s => s.StartTimeUtc).ToList();
        }

        // ── Інвалідація кешу ───────────────────────────────────────

        public async Task InvalidateCacheAsync(Guid salonId, Guid serviceId, DateOnly date)
        {
            var cacheKey = ISlotCacheService.BuildKey(salonId, serviceId, date);
            await _cache.RemoveAsync(cacheKey);
        }

        // ── Core Algorithm ─────────────────────────────────────────

        // Синхронна версія з pre-fetched даними — використовується у Сценарії 1
        // (batch-запити вже виконані вище, DB не потрібна).
        private List<SlotResult> CalculateSlotsForEmployee(
            Employee employee,
            int systemDurationMinutes,
            DateOnly date,
            string timezoneId,
            TimeSpan salonOpening,
            TimeSpan salonClosing,
            List<Booking> bookings,
            List<EmployeeBreak> breaks)
        {
            var schedule = employee.Schedules.FirstOrDefault(s => s.DayOfWeek == date.DayOfWeek);
            if (schedule is null || !schedule.IsWorking)
                return [];

            var effectiveStart = schedule.StartTime < salonOpening ? salonOpening : schedule.StartTime;
            var effectiveEnd   = schedule.EndTime > salonClosing   ? salonClosing : schedule.EndTime;

            var nowUtc       = DateTime.UtcNow;
            var slotDuration = TimeSpan.FromMinutes(systemDurationMinutes);
            var step         = TimeSpan.FromMinutes(SlotStepMinutes);
            var result       = new List<SlotResult>();
            var current      = effectiveStart;

            while (current + slotDuration <= effectiveEnd)
            {
                var slotEnd  = current + slotDuration;
                var startUtc = ConvertToUtc(date, current, timezoneId);
                var endUtc   = ConvertToUtc(date, slotEnd, timezoneId);

                var isValid =
                    startUtc > nowUtc &&
                    !bookings.Any(b => b.StartTimeUtc < endUtc && b.EndTimeUtc > startUtc) &&
                    !breaks.Any(br => br.OverlapsWith(current, slotEnd));

                if (isValid)
                    result.Add(new SlotResult(
                        startUtc, endUtc,
                        current.ToString(@"hh\:mm"),
                        slotEnd.ToString(@"hh\:mm")));

                current = current.Add(step);
            }

            return result;
        }

        // Async версія з власними DB-запитами — використовується у Сценаріях 2, 3, 4
        // (один майстер — N+1 тут не виникає).
        private async Task<List<SlotResult>> CalculateSlotsForEmployeeAsync(
            Employee employee,
            int systemDurationMinutes,
            DateOnly date,
            string timezoneId,
            TimeSpan salonOpening,
            TimeSpan salonClosing)
        {
            var dayOfWeek = date.DayOfWeek;

            var schedule = employee.Schedules
                .FirstOrDefault(s => s.DayOfWeek == dayOfWeek);

            if (schedule is null || !schedule.IsWorking)
                return new List<SlotResult>();

            // ✓ Safety net — обрізаємо межами салону
            var effectiveStart = schedule.StartTime < salonOpening
                ? salonOpening
                : schedule.StartTime;

            var effectiveEnd = schedule.EndTime > salonClosing
                ? salonClosing
                : schedule.EndTime;

            var bookings = await _bookingRepo.GetByEmployeeAndDateAsync(employee.Id, date);
            var breaks = await _breakRepo.GetByEmployeeAndDateAsync(employee.Id, date);

            var nowUtc = DateTime.UtcNow;
            var result = new List<SlotResult>();
            var slotDuration = TimeSpan.FromMinutes(systemDurationMinutes);
            var step = TimeSpan.FromMinutes(SlotStepMinutes);

            var current = effectiveStart;
            var workEnd = effectiveEnd;

            while (current + slotDuration <= workEnd)
            {
                var slotEnd = current + slotDuration;
                var startUtc = ConvertToUtc(date, current, timezoneId);
                var endUtc = ConvertToUtc(date, slotEnd, timezoneId);

                var isValid =
                    startUtc > nowUtc &&
                    !bookings.Any(b => b.StartTimeUtc < endUtc && b.EndTimeUtc > startUtc) &&
                    !breaks.Any(br => br.OverlapsWith(current, slotEnd));

                if (isValid)
                    result.Add(new SlotResult(
                        startUtc, endUtc,
                        current.ToString(@"hh\:mm"),
                        slotEnd.ToString(@"hh\:mm")));

                current = current.Add(step);
            }

            return result;
        }

        private static DateTime ConvertToUtc(DateOnly date, TimeSpan time, string timezoneId)
        {
            var timezone = TimeZoneInfo.FindSystemTimeZoneById(timezoneId);
            var localDateTime = new DateTime(
                date.Year, date.Month, date.Day,
                time.Hours, time.Minutes, time.Seconds,
                DateTimeKind.Unspecified);

            return TimeZoneInfo.ConvertTimeToUtc(localDateTime, timezone);
        }

        private record SlotResult(
            DateTime StartUtc,
            DateTime EndUtc,
            string StartLocal,
            string EndLocal);
    }
}