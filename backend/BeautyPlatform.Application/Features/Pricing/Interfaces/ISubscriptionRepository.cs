using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.Interfaces
{
    public interface ISubscriptionRepository
    {
        Task AddAsync(Subscription subscription);
        Task<Subscription?> GetBySalonIdAsync(Guid salonId);
        Task UpdateAsync(Subscription subscription);
    }
}
