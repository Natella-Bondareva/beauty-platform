using CRMService.Application.Features.BookingServices.Filters;
using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Infrastructure.Repositories
{
    public class BookingRepository : IBookingRepository
    {
        private readonly AppDbContext _context;

        public BookingRepository(AppDbContext context) => _context = context;

        public async Task<Booking?> GetByIdAsync(Guid id)
            => await _context.Bookings.FirstOrDefaultAsync(b => b.Id == id);

        public async Task<Booking?> GetByIdWithDetailsAsync(Guid id)
            => await _context.Bookings
                .Include(b => b.Client)
                .Include(b => b.Employee)
                .Include(b => b.Service)
                .Include(b => b.FieldAnswers)
                    .ThenInclude(a => a.Field)
                .FirstOrDefaultAsync(b => b.Id == id);

        public async Task<List<Booking>> GetBySalonAsync(Guid salonId, BookingFilterDto filter)
        {
            var query = _context.Bookings
                .Include(b => b.Client)
                .Include(b => b.Employee)
                .Include(b => b.Service)
                .Include(b => b.FieldAnswers)
                    .ThenInclude(a => a.Field)
                .Where(b => b.SalonId == salonId);

            if (filter.Date.HasValue)
                query = query.Where(b =>
                    DateOnly.FromDateTime(b.StartTimeUtc) == filter.Date.Value);

            if (filter.DateFrom.HasValue)
                query = query.Where(b =>
                    DateOnly.FromDateTime(b.StartTimeUtc) >= filter.DateFrom.Value);

            if (filter.DateTo.HasValue)
                query = query.Where(b =>
                    DateOnly.FromDateTime(b.StartTimeUtc) <= filter.DateTo.Value);

            if (filter.EmployeeId.HasValue)
                query = query.Where(b => b.EmployeeId == filter.EmployeeId.Value);

            if (filter.Status.HasValue)
                query = query.Where(b => b.Status == filter.Status.Value);

            return await query
                .OrderByDescending(b => b.StartTimeUtc)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetByEmployeeAndDateAsync(Guid employeeId, DateOnly date)
        {
            var (start, end) = DayRange(date);
            return await _context.Bookings
                .Where(b =>
                    b.EmployeeId == employeeId &&
                    b.StartTimeUtc >= start && b.StartTimeUtc < end &&
                    b.Status != BookingStatus.Cancelled)
                .ToListAsync();
        }

        // Один запит замість N (по одному на кожного майстра).
        public async Task<List<Booking>> GetByEmployeesAndDateAsync(
            IReadOnlyList<Guid> employeeIds, DateOnly date)
        {
            if (employeeIds.Count == 0) return [];
            var (start, end) = DayRange(date);
            return await _context.Bookings
                .Where(b =>
                    employeeIds.Contains(b.EmployeeId) &&
                    b.StartTimeUtc >= start && b.StartTimeUtc < end &&
                    b.Status != BookingStatus.Cancelled)
                .ToListAsync();
        }

        private static (DateTime Start, DateTime End) DayRange(DateOnly date)
        {
            var start = date.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);
            return (start, start.AddDays(1));
        }

        public async Task<bool> IsSlotTakenAsync(
            Guid employeeId, DateTime startUtc, DateTime endUtc, Guid? excludeBookingId = null)
        {
            var query = _context.Bookings
                .Where(b =>
                    b.EmployeeId == employeeId &&
                    b.Status != BookingStatus.Cancelled &&
                    // PENDING вважається заблокованим якщо ще не протермінований
                    (b.Status != BookingStatus.Pending || b.ExpiresAt > DateTime.UtcNow) &&
                    b.StartTimeUtc < endUtc &&
                    b.EndTimeUtc > startUtc);

            if (excludeBookingId.HasValue)
                query = query.Where(b => b.Id != excludeBookingId.Value);

            return await query.AnyAsync();
        }

        public async Task<List<Booking>> GetExpiredPendingAsync()
            => await _context.Bookings
                .Where(b =>
                    b.Status == BookingStatus.Pending &&
                    b.ExpiresAt < DateTime.UtcNow)
                .ToListAsync();

        public async Task<List<Booking>> GetConfirmedNoShowsAsync()
            => await _context.Bookings
                .Include(b => b.Client)
                .Where(b =>
                    b.Status == BookingStatus.Confirmed &&
                    b.EndTimeUtc < DateTime.UtcNow)
                .ToListAsync();

        public async Task AddAsync(Booking booking)
        {
            await _context.Bookings.AddAsync(booking);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Booking booking)
            => await _context.SaveChangesAsync();

        // BookingRepository — реалізація
        public async Task<List<Booking>> GetCompletedByMasterAsync(
            Guid masterId,
            DateTime from,
            DateTime to)
        {
            return await _context.Bookings
                .Where(b =>
                    b.EmployeeId == masterId &&
                    b.Status == BookingStatus.Completed &&
                    b.CompletedAt >= from &&
                    b.CompletedAt <= to)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetPlannedByMasterAsync(
            Guid masterId,
            DateTime from,
            DateTime to)
        {
            // Заплановані = підтверджені але ще не виконані в межах періоду
            return await _context.Bookings
                .Where(b =>
                    b.EmployeeId == masterId &&
                    b.Status == BookingStatus.Confirmed &&
                    b.StartTimeUtc >= from &&
                    b.StartTimeUtc <= to)
                .ToListAsync();
        }

        public async Task<List<Booking>> GetByClientPhoneAsync(Guid salonId, string phone)
            => await _context.Bookings
                .Include(b => b.Client)
                .Include(b => b.Employee)
                .Include(b => b.Service)
                .Where(b => b.SalonId == salonId && b.Client.Phone == phone)
                .OrderByDescending(b => b.StartTimeUtc)
                .ToListAsync();
    }
}
