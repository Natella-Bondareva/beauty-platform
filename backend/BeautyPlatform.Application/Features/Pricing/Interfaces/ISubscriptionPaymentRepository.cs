using CRMService.Domain.Entities;

namespace CRMService.Application.Features.Pricing.Interfaces
{
    public interface ISubscriptionPaymentRepository
    {
        Task<List<SubscriptionPayment>> GetBySalonIdAsync(Guid salonId);
        Task AddAsync(SubscriptionPayment payment);
        Task UpdateAsync(SubscriptionPayment payment);
    }
}
