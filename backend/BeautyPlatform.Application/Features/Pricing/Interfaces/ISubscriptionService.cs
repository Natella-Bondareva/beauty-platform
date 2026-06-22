using CRMService.Application.Features.Pricing.DTOs;
using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.Interfaces
{
    public interface ISubscriptionService
    {
        Task<SubscriptionDto> GetAsync(Guid salonId, Guid userId);
        Task AddMasterSlotsAsync(Guid salonId, int count, int months, Guid userId);
        Task AddModuleAsync(Guid salonId, ModuleType module, int months, Guid userId);
        SubscriptionConfigDto GetConfig();
        Task<SubscriptionPaymentDto> ProcessPaymentAsync(Guid salonId, CreatePaymentRequest request, Guid userId);
        Task<List<SubscriptionPaymentDto>> GetPaymentsAsync(Guid salonId, Guid userId);
    }
}
