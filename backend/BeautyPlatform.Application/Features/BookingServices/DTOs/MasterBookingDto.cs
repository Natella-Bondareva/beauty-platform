using CRMService.Domain.Enums;

namespace CRMService.Application.Features.BookingServices.DTOs
{
    public class MasterBookingDto
    {
        public Guid Id { get; set; }
        public BookingStatus Status { get; set; }
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }
        public string StartTimeLocal { get; set; } = default!;
        public string EndTimeLocal { get; set; } = default!;
        public string ClientName { get; set; } = default!;
        public string ClientPhone { get; set; } = default!;
        public int ClientNoShowCount { get; set; }
        public string ServiceName { get; set; } = default!;
        public int ClientDurationMinutes { get; set; }
        public decimal Price { get; set; }
        public string? Notes { get; set; }
        public List<BookingFieldAnswerDto> FieldAnswers { get; set; } = new();
    }
}
