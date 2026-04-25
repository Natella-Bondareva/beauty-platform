using CRMService.Application.Features.Scheduling.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;


namespace CRMService.Infrastructure.Repositories
{
    public class EmployeeBreakRepository : IEmployeeBreakRepository
    {
        private readonly AppDbContext _context;

        public EmployeeBreakRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<EmployeeBreak?> GetByIdAsync(Guid id)
            => await _context.EmployeeBreaks.FirstOrDefaultAsync(b => b.Id == id);

        public async Task<List<EmployeeBreak>> GetByEmployeeAndDateAsync(Guid employeeId, DateOnly date)
            => await _context.EmployeeBreaks
                .Where(b => b.EmployeeId == employeeId && b.Date == date)
                .OrderBy(b => b.StartTime)
                .ToListAsync();

        public async Task<List<EmployeeBreak>> GetByEmployeeAndDateRangeAsync(
            Guid employeeId, DateOnly from, DateOnly to)
            => await _context.EmployeeBreaks
                .Where(b => b.EmployeeId == employeeId && b.Date >= from && b.Date <= to)
                .OrderBy(b => b.Date).ThenBy(b => b.StartTime)
                .ToListAsync();

        public async Task AddAsync(EmployeeBreak employeeBreak)
        {
            await _context.EmployeeBreaks.AddAsync(employeeBreak);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(EmployeeBreak employeeBreak)
            => await _context.SaveChangesAsync();

        public async Task DeleteAsync(EmployeeBreak employeeBreak)
        {
            _context.EmployeeBreaks.Remove(employeeBreak);
            await _context.SaveChangesAsync();
        }
    }
}
