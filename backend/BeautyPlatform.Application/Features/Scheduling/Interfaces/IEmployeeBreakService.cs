using CRMService.Application.Features.Scheduling.Commands;
using CRMService.Application.Features.Scheduling.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.Interfaces
{
    public interface IEmployeeBreakService
    {
        Task<Guid> CreateAsync(Guid employeeId, CreateBreakCommand command, Guid salonId, Guid ownerId);
        Task UpdateAsync(Guid breakId, UpdateBreakCommand command, Guid salonId, Guid ownerId);
        Task DeleteAsync(Guid breakId, Guid salonId, Guid ownerId);
        Task<List<EmployeeBreakDto>> GetByEmployeeAndDateAsync(Guid employeeId, DateOnly date, Guid salonId, Guid ownerId);
    }
}
