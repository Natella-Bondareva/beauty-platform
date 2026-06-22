using CRMService.Application.Features.Pricing.DTOs;
using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.SalaryModule.Interfaces
{
    public interface IContractRepository
    {
        Task<MasterContract?> GetByIdAsync(Guid id);          
        Task<MasterContract?> GetActiveByMasterIdAsync(Guid masterId);
        Task<List<MasterContract>> GetActiveBySalonIdAsync(Guid salonId);
        Task AddAsync(MasterContract contract);
        Task UpdateAsync(MasterContract contract);
    }
}
