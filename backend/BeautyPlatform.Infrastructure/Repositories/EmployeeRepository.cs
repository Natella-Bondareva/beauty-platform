using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRMService.Infrastructure.Repositories
{
    public class EmployeeRepository : IEmployeeRepository
    {
        private readonly AppDbContext _context;

        public EmployeeRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Employee?> GetByIdAsync(Guid id)
        {
            return await _context.Employees
                .Include(e => e.Categories)
                    .ThenInclude(ec => ec.Category)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Employee?> GetByIdWithServicesAsync(Guid id)
        {
            return await _context.Employees
                .Include(e => e.Categories)
                    .ThenInclude(ec => ec.Category)
                .Include(e => e.Services)
                    .ThenInclude(es => es.Service)
                        .ThenInclude(s => s.Images)
                .Include(e => e.Schedules)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Employee?> GetByIdWithScheduleAsync(Guid id)
        {
            return await _context.Employees
                .Include(e => e.Categories)
                    .ThenInclude(ec => ec.Category)
                .Include(e => e.Schedules)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<List<Employee>> GetBySalonIdAsync(Guid salonId)
        {
            return await _context.Employees
                .Include(e => e.Categories)
                    .ThenInclude(ec => ec.Category)
                .Include(e => e.Services)
                .Where(e => e.SalonId == salonId)
                .OrderBy(e => e.FullName)
                .ToListAsync();
        }

        public async Task<bool> EmailExistsInSalonAsync(Guid salonId, string email, Guid? excludeId = null)
        {
            var query = _context.Employees
                .Where(e => e.SalonId == salonId && e.Email == email.ToLowerInvariant());

            if (excludeId.HasValue)
                query = query.Where(e => e.Id != excludeId.Value);

            return await query.AnyAsync();
        }

        public async Task AddAsync(Employee employee)
        {
            await _context.Employees.AddAsync(employee);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Employee employee)
        {
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Employee employee)
        {
            _context.Employees.Remove(employee);
            await _context.SaveChangesAsync();
        }

        public async Task AddServiceToEmployeeAsync(Guid employeeId, EmployeeService employeeService)
        {
            await _context.EmployeeServices.AddAsync(employeeService);
            await _context.SaveChangesAsync();
        }

        public async Task RemoveServiceFromEmployeeAsync(Guid employeeId, Guid serviceId)
        {
            var link = await _context.EmployeeServices
                .FirstOrDefaultAsync(es => es.EmployeeId == employeeId && es.ServiceId == serviceId)
                ?? throw new KeyNotFoundException("Service assignment not found.");

            _context.EmployeeServices.Remove(link);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateEmployeeServicePriceAsync(Guid employeeId, Guid serviceId, decimal? priceOverride)
        {
            var link = await _context.EmployeeServices
                .FirstOrDefaultAsync(es => es.EmployeeId == employeeId && es.ServiceId == serviceId)
                ?? throw new KeyNotFoundException("Service assignment not found.");

            link.UpdatePriceOverride(priceOverride);
            await _context.SaveChangesAsync();
        }

        public async Task ReplaceScheduleAsync(Guid employeeId, List<MasterSchedule> newSchedule)
        {
            var existing = await _context.MasterSchedules
                .Where(s => s.EmployeeId == employeeId)
                .ToListAsync();

            _context.MasterSchedules.RemoveRange(existing);
            await _context.MasterSchedules.AddRangeAsync(newSchedule);
            await _context.SaveChangesAsync();
        }

        public async Task ReplaceCategoriesAsync(Guid employeeId, List<Guid> categoryIds)
        {
            var existing = await _context.EmployeeCategories
                .Where(ec => ec.EmployeeId == employeeId)
                .ToListAsync();

            _context.EmployeeCategories.RemoveRange(existing);

            var newCategories = categoryIds.Select(cId =>
                new EmployeeCategory(employeeId, cId));

            await _context.EmployeeCategories.AddRangeAsync(newCategories);
            await _context.SaveChangesAsync();
        }

        public async Task<Employee?> GetByUserIdAsync(Guid userId, Guid salonId)
        {
            return await _context.Employees
                .FirstOrDefaultAsync(e => e.UserId == userId && e.SalonId == salonId);
        }
    }
}