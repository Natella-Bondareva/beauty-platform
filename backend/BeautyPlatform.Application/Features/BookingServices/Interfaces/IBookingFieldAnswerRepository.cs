using CRMService.Domain.Entities;

namespace CRMService.Application.Features.BookingServices.Interfaces
{
    public interface IBookingFieldAnswerRepository
    {
        Task<List<BookingFieldAnswer>> GetByBookingIdAsync(Guid bookingId);
        Task SaveAnswersAsync(Guid bookingId, IEnumerable<BookingFieldAnswer> answers);
    }
}
