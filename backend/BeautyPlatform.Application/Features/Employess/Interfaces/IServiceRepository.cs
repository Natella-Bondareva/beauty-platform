using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employees.Interfaces
{
    public interface IServiceRepository
    {
        Task<Service?> GetByIdAsync(Guid id);
        Task<Service?> GetByIdWithImagesAsync(Guid id);
        Task<Service?> GetByIdWithEmployeesAsync(Guid id);
        Task<List<Service>> GetBySalonIdAsync(Guid salonId);
        Task AddAsync(Service service);
        Task UpdateAsync(Service service);
    }
}
