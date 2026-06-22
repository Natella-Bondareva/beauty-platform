namespace CRMService.Application.Features.BookingServices.Commands
{
    public record SubmitBookingAnswersCommand(List<BookingFieldAnswerInput> Answers);

    public record BookingFieldAnswerInput(
        Guid BookingFieldId,
        string? TextValue,
        string? FileUrl);
}
