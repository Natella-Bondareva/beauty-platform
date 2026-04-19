using CRMService.Application.Features.Employess.Commands.Employee_Commands;
using CRMService.Application.Features.Employess.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace CRMService.Application.Features.Employess.Interfaces
{
    public interface IEmployeeService
    {
        Task<Guid> CreateAsync(CreateEmployeeCommand command, Guid salonId, Guid ownerId);
        Task UpdateAsync(Guid employeeId, UpdateEmployeeCommand command, Guid salonId, Guid ownerId);
        Task DeactivateAsync(Guid employeeId, Guid salonId, Guid ownerId);
        Task<EmployeeDto> GetByIdAsync(Guid employeeId, Guid salonId, Guid ownerId);
        Task<List<EmployeeListItemDto>> GetBySalonAsync(Guid salonId, Guid ownerId);

        Task AssignServiceAsync(Guid employeeId, Guid serviceId, decimal? priceOverride, Guid salonId, Guid ownerId);
        Task RemoveServiceAsync(Guid employeeId, Guid serviceId, Guid salonId, Guid ownerId);
        Task UpdateServicePriceAsync(Guid employeeId, Guid serviceId, decimal? priceOverride, Guid salonId, Guid ownerId);

        Task SetScheduleAsync(Guid employeeId, List<ScheduleItemCommand> schedule, Guid salonId, Guid ownerId);
        Task<Guid> RegisterSelfAsEmployeeAsync(RegisterSelfAsEmployeeCommand command, Guid salonId, Guid ownerId);
    }
}
