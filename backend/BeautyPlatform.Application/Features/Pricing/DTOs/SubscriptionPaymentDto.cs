namespace CRMService.Application.Features.Pricing.DTOs
{
    public class SubscriptionPaymentDto
    {
        public Guid Id { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? Note { get; set; }
        public string? ExternalPaymentId { get; set; }
    }

    public record CreatePaymentRequest(
        string ItemType,   // "Module" | "MasterSlots"
        int? ModuleId,     // ModuleType enum value (for ItemType = Module)
        int? SlotCount,    // number of master slots (for ItemType = MasterSlots)
        int Months         // subscription term in months
    );
}
