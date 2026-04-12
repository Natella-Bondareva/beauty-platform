using CRMService.Application.Features.Auth.Interfaces;
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
    public class SalonRepository : ISalonRepository
    {
        private readonly AppDbContext _context;

        public SalonRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Salon?> GetByIdAsync(Guid id)
        {
            return await _context.Salons
                .Include(x => x.Settings)
                    .ThenInclude(x => x.BreakTimes)
                .Include(x => x.Settings)
                    .ThenInclude(x => x.RegularDaysOff)
                .Include(x => x.Settings)
                    .ThenInclude(x => x.SpecialDaysOff)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task<Salon?> GetByOwnerIdAsync(Guid ownerId)
        {
            return await _context.Salons
                .Include(x => x.Settings)
                    .ThenInclude(x => x.BreakTimes)
                .Include(x => x.Settings)
                    .ThenInclude(x => x.RegularDaysOff)
                .Include(x => x.Settings)
                    .ThenInclude(x => x.SpecialDaysOff)
                .FirstOrDefaultAsync(x => x.OwnerId == ownerId);
        }

        public async Task AddAsync(Salon salon)
        {
            await _context.Salons.AddAsync(salon);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Salon salon)
        {
            await _context.SaveChangesAsync();
        }
    }
}
