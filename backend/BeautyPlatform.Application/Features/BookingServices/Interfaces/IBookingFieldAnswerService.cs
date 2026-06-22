using CRMService.Application.Features.BookingServices.Commands;

namespace CRMService.Application.Features.BookingServices.Interfaces
{
    public interface IBookingFieldAnswerService
    {
        Task SubmitAnswersAsync(Guid bookingId, SubmitBookingAnswersCommand command);
    }
}
