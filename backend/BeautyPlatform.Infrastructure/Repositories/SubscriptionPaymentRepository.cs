using CRMService.Application.Features.Pricing.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRMService.Infrastructure.Repositories
{
    public class SubscriptionPaymentRepository : ISubscriptionPaymentRepository
    {
        private readonly AppDbContext _context;

        public SubscriptionPaymentRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<SubscriptionPayment>> GetBySalonIdAsync(Guid salonId)
            => await _context.SubscriptionPayments
                .Where(p => p.SalonId == salonId)
                .ToListAsync();

        public async Task AddAsync(SubscriptionPayment payment)
        {
            await _context.SubscriptionPayments.AddAsync(payment);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(SubscriptionPayment payment)
            => await _context.SaveChangesAsync();
    }
}
