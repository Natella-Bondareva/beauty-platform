using CRMService.Domain.Enums;


namespace CRMService.Domain.Entities
{
    public class SubscriptionPayment
    {
        public Guid Id { get; private set; }
        public Guid SalonId { get; private set; }
        public decimal Amount { get; private set; }
        public string Description { get; private set; } = string.Empty;
        public SubscriptionPaymentStatus Status { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        public string? Note { get; private set; }
        // Reserved for future payment provider (Monobank, LiqPay): store invoice/transaction ID here
        public string? ExternalPaymentId { get; private set; }

        private SubscriptionPayment() { }

        public static SubscriptionPayment Create(Guid salonId, decimal amount, string description)
            => new()
            {
                Id = Guid.NewGuid(),
                SalonId = salonId,
                Amount = amount,
                Description = description,
                Status = SubscriptionPaymentStatus.Pending,
                CreatedAt = DateTime.UtcNow,
            };

        public void Complete(string? externalPaymentId = null, string? note = null)
        {
            Status = SubscriptionPaymentStatus.Completed;
            CompletedAt = DateTime.UtcNow;
            ExternalPaymentId = externalPaymentId;
            Note = note;
        }

        public void Fail(string? note = null)
        {
            Status = SubscriptionPaymentStatus.Failed;
            CompletedAt = DateTime.UtcNow;
            Note = note;
        }
    }
}
