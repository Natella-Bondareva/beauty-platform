using CRMService.Application.Features.Employess.Commands.Employee_Commands;
using CRMService.Application.Features.Employess.Commands.Service_Commands;
using CRMService.Application.Features.Employess.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.Interfaces
{
    public interface ISpecializationCategoryService
    {
        Task<List<CategoryDto>> GetAvailableAsync(Guid salonId);
        Task<Guid> CreateCustomAsync(CreateCategoryCommand command, Guid salonId, Guid ownerId);
        Task UpdateCustomAsync(Guid categoryId, UpdateCategoryCommand command, Guid salonId, Guid ownerId);

        /// <summary>
        /// Категорії що реально представлені в салоні —
        /// є хоча б один активний майстер в цій категорії.
        /// Використовується для відображення меню послуг клієнту.
        /// </summary>
        Task<List<CategoryDto>> GetActiveBySalonAsync(Guid salonId);
    }
}
