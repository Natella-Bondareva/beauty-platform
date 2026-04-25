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

            var result = new List<AvailableSlotDto>();

            foreach (var employee in employees)
            {
                var employeeService = employee.Services
                    .FirstOrDefault(s => s.ServiceId == query.ServiceId);

                // ✓ ефективна тривалість з урахуванням override
                var effectiveSystemDuration = employeeService?.GetEffectiveSystemDuration()
                    ?? service.SystemDurationMinutes;
                var effectiveClientDuration = employeeService?.GetEffectiveClientDuration()
                    ?? service.ClientDurationMinutes;
                var effectivePrice = employeeService?.GetEffectivePrice()
                    ?? service.Price;

                // ✓ передаємо години салону
                var slots = await CalculateSlotsForEmployeeAsync(
                    employee,
                    effectiveSystemDuration,
                    query.Date,
                    salon.Settings.Timezone,
                    salon.Settings.OpeningTime,
                    salon.Settings.ClosingTime);

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

        // ── Інвалідація кешу ───────────────────────────────────────

        public async Task InvalidateCacheAsync(Guid salonId, Guid serviceId, DateOnly date)
        {
            var cacheKey = ISlotCacheService.BuildKey(salonId, serviceId, date);
            await _cache.RemoveAsync(cacheKey);
        }

        // ── Core Algorithm ─────────────────────────────────────────

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