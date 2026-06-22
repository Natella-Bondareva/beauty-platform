using CRMService.Application.Features.BookingServices.Filters;
using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Infrastructure.Repositories
{
    public class BookingFieldRepository : IBookingFieldRepository
    {
        private readonly AppDbContext _context;

        public BookingFieldRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<BookingField>> GetBySalonIdAsync(Guid salonId)
        {
            return await _context.BookingFields
                .Include(x => x.Options)
                .Where(x => x.SalonId == salonId)
                .OrderBy(x => x.Order)
                .ToListAsync();
        }

        public async Task<BookingField?> GetByIdAsync(Guid id)
        {
            return await _context.BookingFields
                .Include(x => x.Options)
                .FirstOrDefaultAsync(x => x.Id == id);
        }

        public async Task AddAsync(BookingField field)
        {
            await _context.BookingFields.AddAsync(field);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(BookingField field)
        {
            await _context.SaveChangesAsync();
        }
    }
}
