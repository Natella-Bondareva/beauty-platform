namespace CRMService.Application.Features.BookingServices.DTOs
{
    public class ClientDto
    {
        public Guid Id { get; set; }
        public string Phone { get; set; } = default!;
        public string? FullName { get; set; }
        public int NoShowCount { get; set; }
        public DateTime? LastVisitAt { get; set; }
    }
}
