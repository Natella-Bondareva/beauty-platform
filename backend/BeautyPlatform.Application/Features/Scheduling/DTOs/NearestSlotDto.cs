namespace CRMService.Application.Features.Scheduling.DTOs
{
    public class NearestSlotDto
    {
        public Guid EmployeeId { get; set; }
        public string EmployeeName { get; set; } = default!;
        public string? EmployeeAvatarUrl { get; set; }
        public DateOnly Date { get; set; }
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }
        public string StartTimeLocal { get; set; } = default!;
        public string EndTimeLocal { get; set; } = default!;
        public decimal Price { get; set; }
        public int ClientDurationMinutes { get; set; }
    }
}
