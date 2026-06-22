namespace CRMService.Application.Features.BookingServices.DTOs
{
    public class BookingFieldDto
    {
        public Guid Id { get; set; }
        public string Label { get; set; } = null!;
        public string? Placeholder { get; set; }
        public string Type { get; set; } = null!;
        public string Scope { get; set; } = null!;
        public Guid? TargetId { get; set; }
        public bool IsRequired { get; set; }
        public int Order { get; set; }
        public List<string> Options { get; set; } = new();
    }
}
