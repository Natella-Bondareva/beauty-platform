using CRMService.Application.Features.Pricing.DTOs;
using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.SalaryModule.Interfaces
{
    public interface ISalaryPaymentRepository
    {
        Task<SalaryPayment?> GetByIdAsync(Guid id);
        Task<List<SalaryPayment>> GetByMasterAsync(
            Guid masterId, DateTime? from, DateTime? to);
        Task<List<SalaryPayment>> GetBySalonAsync(
            Guid salonId, DateTime? from, DateTime? to);
        Task AddAsync(SalaryPayment payment);
        Task UpdateAsync(SalaryPayment payment);
    }
}
