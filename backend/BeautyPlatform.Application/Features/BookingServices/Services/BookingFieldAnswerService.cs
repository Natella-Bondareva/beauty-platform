using CRMService.Application.Features.BookingServices.Commands;
using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;

namespace CRMService.Application.Features.BookingServices.Services
{
    public class BookingFieldAnswerService : IBookingFieldAnswerService
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly IBookingFieldAnswerRepository _answerRepo;

        public BookingFieldAnswerService(
            IBookingRepository bookingRepo,
            IBookingFieldAnswerRepository answerRepo)
        {
            _bookingRepo = bookingRepo;
            _answerRepo = answerRepo;
        }

        public async Task SubmitAnswersAsync(Guid bookingId, SubmitBookingAnswersCommand command)
        {
            var booking = await _bookingRepo.GetByIdAsync(bookingId)
                ?? throw new KeyNotFoundException("Booking not found.");

            if (booking.Status is BookingStatus.Cancelled
                                or BookingStatus.Completed
                                or BookingStatus.NoShow)
                throw new InvalidOperationException(
                    "Cannot submit answers for a booking with status: " + booking.Status);

            var answers = command.Answers
                .Select(a => BookingFieldAnswer.Create(bookingId, a.BookingFieldId, a.TextValue, a.FileUrl))
                .ToList();

            await _answerRepo.SaveAnswersAsync(bookingId, answers);
        }
    }
}
