using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employees.Interfaces
{
    public interface IEmployeeRepository
    {
        Task<Employee?> GetByIdAsync(Guid id);
        Task<Employee?> GetByIdWithServicesAsync(Guid id);
        Task<Employee?> GetByIdWithScheduleAsync(Guid id);
        Task<List<Employee>> GetBySalonIdAsync(Guid salonId);
        Task<bool> EmailExistsInSalonAsync(Guid salonId, string email, Guid? excludeId = null);
        Task AddAsync(Employee employee);
        Task UpdateAsync(Employee employee);
        Task DeleteAsync(Employee employee);
        Task AddServiceToEmployeeAsync(Guid employeeId, EmployeeService employeeService);
        Task RemoveServiceFromEmployeeAsync(Guid employeeId, Guid serviceId);
        Task ReplaceScheduleAsync(Guid employeeId, List<MasterSchedule> schedule);
        Task ReplaceCategoriesAsync(Guid employeeId, List<Guid> categoryIds);
        Task<Employee?> GetByUserIdAsync(Guid ownerId, Guid salonId);
        Task<List<Employee>> GetActiveByServiceIdAsync(Guid serviceId, Guid salonId);
        Task UpdateEmployeeServiceOverridesAsync(
            Guid employeeId,
            Guid serviceId,
            decimal? priceOverride,
            int? systemDurationOverride,
            int? clientDurationOverride);
    }
}
