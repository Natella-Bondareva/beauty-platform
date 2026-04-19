using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employess.Commands.Employee_Commands;
using CRMService.Application.Features.Employess.Commands.Service_Commands;
using CRMService.Application.Features.Employess.DTOs;
using CRMService.Application.Features.Employess.Interfaces;
using CRMService.Domain.Entities;

namespace CRMService.Application.Features.Employees.Services
{
    public class SpecializationCategoryService : ISpecializationCategoryService
    {
        private readonly ISpecializationCategoryRepository _categoryRepo;
        private readonly ISalonRepository _salonRepo;

        public SpecializationCategoryService(
            ISpecializationCategoryRepository categoryRepo,
            ISalonRepository salonRepo)
        {
            _categoryRepo = categoryRepo;
            _salonRepo = salonRepo;
        }

        public async Task<List<CategoryDto>> GetAvailableAsync(Guid salonId)
        {
            var categories = await _categoryRepo.GetAvailableForSalonAsync(salonId);
            return categories.Select(MapToDto).ToList();
        }

        public async Task<Guid> CreateCustomAsync(CreateCategoryCommand command, Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);

            var category = SpecializationCategory.CreateForSalon(
                salonId,
                command.Name,
                command.Description,
                command.IconUrl);

            await _categoryRepo.AddAsync(category);
            return category.Id;
        }

        public async Task UpdateCustomAsync(Guid categoryId, UpdateCategoryCommand command, Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);

            var category = await _categoryRepo.GetByIdAsync(categoryId)
                ?? throw new KeyNotFoundException("Category not found.");

            if (category.IsGlobal)
                throw new InvalidOperationException("Global categories cannot be modified by salon.");

            category.EnsureSalonAccess(salonId);
            category.Update(command.Name, command.Description, command.IconUrl);
            await _categoryRepo.UpdateAsync(category);
        }

        private async Task EnsureSalonOwnership(Guid salonId, Guid ownerId)
        {
            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);
        }

        private static CategoryDto MapToDto(SpecializationCategory c) => new()
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            IconUrl = c.IconUrl,
            IsGlobal = c.IsGlobal,
            DefaultServices = c.DefaultServices.OrderBy(d => d.SortOrder).Select(d => new CategoryDefaultServiceDto
            {
                Id = d.Id,
                Name = d.Name,
                SystemDurationMinutes = d.SystemDurationMinutes,
                ClientDurationMinutes = d.ClientDurationMinutes,
                SuggestedPrice = d.SuggestedPrice
            }).ToList()
        };
    }
}