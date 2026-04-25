using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Infrastructure.Repositories
{
    public class SpecializationCategoryRepository : ISpecializationCategoryRepository
    {
        private readonly AppDbContext _context;

        public SpecializationCategoryRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<SpecializationCategory?> GetByIdAsync(Guid id)
        {
            return await _context.SpecializationCategories
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<SpecializationCategory?> GetByIdWithDefaultServicesAsync(Guid id)
        {
            return await _context.SpecializationCategories
                .Include(c => c.DefaultServices)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<List<SpecializationCategory>> GetAvailableForSalonAsync(Guid salonId)
        {
            return await _context.SpecializationCategories
                .Include(c => c.DefaultServices)
                .Where(c => c.IsActive && (c.IsGlobal || c.SalonId == salonId))
                .OrderBy(c => c.IsGlobal ? 0 : 1) // глобальні першими
                .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task AddAsync(SpecializationCategory category)
        {
            await _context.SpecializationCategories.AddAsync(category);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(SpecializationCategory category)
        {
            await _context.SaveChangesAsync();
        }

        public async Task<List<SpecializationCategory>> GetActiveBySalonAsync(Guid salonId)
        {
            var activeCategoryIds = await _context.EmployeeCategories
                .Include(ec => ec.Employee)
                .Where(ec => ec.Employee.SalonId == salonId && ec.Employee.IsActive)
                .Select(ec => ec.CategoryId)
                .Distinct()
                .ToListAsync();

            if (!activeCategoryIds.Any())
                return new List<SpecializationCategory>();

            return await _context.SpecializationCategories
                .Where(c => activeCategoryIds.Contains(c.Id))
                .Include(c => c.DefaultServices)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }
    }
}
