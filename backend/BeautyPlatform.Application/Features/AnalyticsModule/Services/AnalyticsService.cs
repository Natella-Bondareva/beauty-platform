using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.BookingServices.Filters;
using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly ISalonRepository _salonRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IEmployeeRepository _employeeRepository;

        public AnalyticsService(
            ISalonRepository salonRepository,
            IBookingRepository bookingRepository,
            IEmployeeRepository employeeRepository)
        {
            _salonRepository = salonRepository;
            _bookingRepository = bookingRepository;
            _employeeRepository = employeeRepository;
        }

        public async Task<SalonAnalyticsDto> GetAsync(
            Guid salonId,
            DateTime from,
            DateTime to,
            Guid ownerId)
        {
            var salon = await _salonRepository.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);

            // Завантажуємо всі записи за період одним запитом
            var filter = new BookingFilterDto { DateFrom = DateOnly.FromDateTime(from), DateTo = DateOnly.FromDateTime(to) };
            var bookings = await _bookingRepository.GetBySalonAsync(salonId, filter);

            // Попередній період такої ж тривалості для порівняння
            var periodDays = (to - from).Days;
            var prevFrom = from.AddDays(-periodDays);
            var prevFilter = new BookingFilterDto { DateFrom = DateOnly.FromDateTime(prevFrom), DateTo = DateOnly.FromDateTime(from) };
            var prevBookings = await _bookingRepository.GetBySalonAsync(salonId, prevFilter);

            var employees = await _employeeRepository.GetBySalonWithSchedulesAsync(salonId);

            var completed = bookings.Where(b => b.Status == BookingStatus.Completed).ToList();
            var cancelled = bookings.Where(b => b.Status == BookingStatus.Cancelled).ToList();
            var noShow = bookings.Where(b => b.Status == BookingStatus.NoShow).ToList();
            var pending = bookings.Where(b => b.Status == BookingStatus.Pending).ToList();
            var confirmed = bookings.Where(b => b.Status == BookingStatus.Confirmed).ToList();
            var prevCompleted = prevBookings.Where(b => b.Status == BookingStatus.Completed).ToList();

            return new SalonAnalyticsDto
            {
                Finance = BuildFinanceStats(completed, prevCompleted, confirmed),
                Bookings = BuildBookingStats(bookings, completed, cancelled, noShow, pending),
                Employees = BuildEmployeeStats(completed, employees, from, to),
                TopServices = BuildServiceStats(completed),
                Clients = BuildClientStats(completed, from),
                RevenueChart = BuildRevenueChart(completed, from, to)
            };
        }

        private static FinanceStatsDto BuildFinanceStats(
            List<Booking> completed,
            List<Booking> prevCompleted,
            List<Booking> confirmed)
        {
            var revenue = completed.Sum(b => b.Price);
            var prevRevenue = prevCompleted.Sum(b => b.Price);
            var growth = prevRevenue == 0 ? 0
                : Math.Round((revenue - prevRevenue) / prevRevenue * 100, 1);

            return new FinanceStatsDto
            {
                Revenue = revenue,
                PreviousPeriodRevenue = prevRevenue,
                RevenueGrowthPercent = growth,
                AverageCheck = completed.Count == 0 ? 0
                    : Math.Round(revenue / completed.Count, 2),
                ExpectedRevenue = confirmed.Sum(b => b.Price)
            };
        }

        private static BookingStatsDto BuildBookingStats(
            List<Booking> all,
            List<Booking> completed,
            List<Booking> cancelled,
            List<Booking> noShow,
            List<Booking> pending)
        {
            var total = all.Count;
            return new BookingStatsDto
            {
                Total = total,
                Completed = completed.Count,
                Cancelled = cancelled.Count,
                NoShow = noShow.Count,
                Pending = pending.Count,
                CompletionRate = total == 0 ? 0 : Math.Round((decimal)completed.Count / total * 100, 1),
                CancellationRate = total == 0 ? 0 : Math.Round((decimal)cancelled.Count / total * 100, 1),
                NoShowRate = total == 0 ? 0 : Math.Round((decimal)noShow.Count / total * 100, 1)
            };
        }

        private static List<EmployeeStatsDto> BuildEmployeeStats(
            List<Booking> completed,
            List<Employee> employees,
            DateTime from,
            DateTime to)
        {
            var result = new List<EmployeeStatsDto>();

            foreach (var emp in employees.Where(e => e.IsActive))
            {
                var empBookings = completed.Where(b => b.EmployeeId == emp.Id).ToList();
                var revenue = empBookings.Sum(b => b.Price);

                // Розрахунок доступних годин за період на основі MasterSchedule
                var availableMinutes = CalculateAvailableMinutes(emp.Schedules, from, to);

                // Фактично зайнятих хвилин
                var bookedMinutes = empBookings
                    .Sum(b => (b.EndTimeUtc - b.StartTimeUtc).TotalMinutes);

                var workload = availableMinutes == 0 ? 0
                    : Math.Round((decimal)bookedMinutes / availableMinutes * 100, 1);

                result.Add(new EmployeeStatsDto
                {
                    EmployeeId = emp.Id,
                    FullName = emp.FullName,
                    AvatarUrl = emp.AvatarUrl,
                    Revenue = revenue,
                    CompletedBookings = empBookings.Count,
                    WorkloadPercent = Math.Min(workload, 100), // не більше 100%
                    AverageCheck = empBookings.Count == 0 ? 0
                        : Math.Round(revenue / empBookings.Count, 2)
                });
            }

            return result.OrderByDescending(e => e.Revenue).ToList();
        }

        private static decimal CalculateAvailableMinutes(
            IReadOnlyCollection<MasterSchedule> schedules,
            DateTime from,
            DateTime to)
        {
            var totalMinutes = 0.0;
            var current = from.Date;

            while (current <= to.Date)
            {
                var dayOfWeek = current.DayOfWeek;
                var schedule = schedules.FirstOrDefault(s =>
                    s.DayOfWeek == dayOfWeek && s.IsWorking);

                if (schedule != null)
                    totalMinutes += (schedule.EndTime - schedule.StartTime).TotalMinutes;

                current = current.AddDays(1);
            }

            return (decimal)totalMinutes;
        }

        private static List<ServiceStatsDto> BuildServiceStats(List<Booking> completed)
        {
            return completed
                .GroupBy(b => new { b.ServiceId, b.Service?.Name })
                .Select(g => new ServiceStatsDto
                {
                    ServiceId = g.Key.ServiceId,
                    ServiceName = g.Key.Name ?? "Unknown",
                    BookingsCount = g.Count(),
                    TotalRevenue = g.Sum(b => b.Price),
                    AveragePrice = Math.Round(g.Average(b => b.Price), 2)
                })
                .OrderByDescending(s => s.BookingsCount)
                .Take(5)
                .ToList();
        }

        private static ClientStatsDto BuildClientStats(List<Booking> completed, DateTime from)
        {
            var uniqueClients = completed.Select(b => b.ClientId).Distinct().ToList();

            // Новий клієнт — перший запис саме в цьому періоді
            var newClients = completed
                .GroupBy(b => b.ClientId)
                .Count(g => g.Min(b => b.CreatedAt) >= from);

            var returning = uniqueClients.Count - newClients;

            return new ClientStatsDto
            {
                TotalUnique = uniqueClients.Count,
                NewClients = newClients,
                ReturningClients = returning,
                RetentionRate = uniqueClients.Count == 0 ? 0
                    : Math.Round((decimal)returning / uniqueClients.Count * 100, 1)
            };
        }

        private static List<DailyRevenueDto> BuildRevenueChart(
            List<Booking> completed,
            DateTime from,
            DateTime to)
        {
            // Групуємо по даті
            var grouped = completed
                .GroupBy(b => DateOnly.FromDateTime(b.CompletedAt!.Value))
                .ToDictionary(g => g.Key, g => g.ToList());

            var result = new List<DailyRevenueDto>();
            var current = DateOnly.FromDateTime(from);
            var end = DateOnly.FromDateTime(to);

            // Заповнюємо всі дні включно з тими де не було записів
            while (current <= end)
            {
                var dayBookings = grouped.GetValueOrDefault(current) ?? new List<Booking>();
                result.Add(new DailyRevenueDto
                {
                    Date = current,
                    Revenue = dayBookings.Sum(b => b.Price),
                    CompletedBookings = dayBookings.Count
                });
                current = current.AddDays(1);
            }

            return result;
        }
    }
}
