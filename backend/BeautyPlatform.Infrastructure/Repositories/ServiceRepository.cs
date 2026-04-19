using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRMService.Infrastructure.Repositories
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly AppDbContext _context;

        public ServiceRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Service?> GetByIdAsync(Guid id)
        {
            return await _context.Services
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Service?> GetByIdWithImagesAsync(Guid id)
        {
            return await _context.Services
                .Include(s => s.Images)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Service?> GetByIdWithEmployeesAsync(Guid id)
        {
            return await _context.Services
                .Include(s => s.Images)
                .Include(s => s.EmployeeServices)
                    .ThenInclude(es => es.Employee)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<List<Service>> GetBySalonIdAsync(Guid salonId)
        {
            return await _context.Services
                .Include(s => s.Images)
                .Where(s => s.SalonId == salonId)
                .OrderBy(s => s.Name)
                .ToListAsync();
        }

        public async Task AddAsync(Service service)
        {
            await _context.Services.AddAsync(service);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Service service)
        {
            await _context.SaveChangesAsync();
        }
    }

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
    }
}