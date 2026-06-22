namespace CRMService.Application.Features.BookingServices.DTOs
{
    public class BookingFieldAnswerDto
    {
        public Guid BookingFieldId { get; set; }
        public string Label { get; set; } = default!;
        public string Type { get; set; } = default!;
        public string? TextValue { get; set; }
        public string? FileUrl { get; set; }
    }
}
