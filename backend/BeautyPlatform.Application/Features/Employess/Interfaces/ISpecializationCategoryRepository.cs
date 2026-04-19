using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employees.Interfaces
{
    public interface ISpecializationCategoryRepository
    {
        Task<SpecializationCategory?> GetByIdAsync(Guid id);
        Task<SpecializationCategory?> GetByIdWithDefaultServicesAsync(Guid id);

        /// <summary>Повертає глобальні + кастомні для цього салону</summary>
        Task<List<SpecializationCategory>> GetAvailableForSalonAsync(Guid salonId);
        Task AddAsync(SpecializationCategory category);
        Task UpdateAsync(SpecializationCategory category);
    }
}
