using CRMService.Application.Features.BookingServices.Filters;
using CRMService.Domain.Entities;

namespace CRMService.Application.Features.BookingServices.Interfaces

{
    public interface IBookingRepository
    {
        Task<Booking?> GetByIdAsync(Guid id);
        Task<Booking?> GetByIdWithDetailsAsync(Guid id);
        Task<List<Booking>> GetBySalonAsync(Guid salonId, BookingFilterDto filter);
        Task<List<Booking>> GetByEmployeeAndDateAsync(Guid employeeId, DateOnly date);
        Task<bool> IsSlotTakenAsync(Guid employeeId, DateTime startUtc, DateTime endUtc, Guid? excludeBookingId = null);
        Task<List<Booking>> GetExpiredPendingAsync();
        Task<List<Booking>> GetConfirmedNoShowsAsync();
        Task AddAsync(Booking booking);
        Task UpdateAsync(Booking booking);
    }
}
