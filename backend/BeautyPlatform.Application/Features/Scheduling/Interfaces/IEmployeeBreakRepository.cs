using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.Interfaces
{
    public interface IEmployeeBreakRepository
    {
        Task<EmployeeBreak?> GetByIdAsync(Guid id);
        Task<List<EmployeeBreak>> GetByEmployeeAndDateAsync(Guid employeeId, DateOnly date);
        Task<List<EmployeeBreak>> GetByEmployeeAndDateRangeAsync(Guid employeeId, DateOnly from, DateOnly to);
        Task AddAsync(EmployeeBreak employeeBreak);
        Task UpdateAsync(EmployeeBreak employeeBreak);
        Task DeleteAsync(EmployeeBreak employeeBreak);
    }
}
