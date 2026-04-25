using CRMService.Application.Features.BookingServices.Interfaces;
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
    public class ClientRepository : IClientRepository
    {
        private readonly AppDbContext _context;

        public ClientRepository(AppDbContext context) => _context = context;

        public async Task<Client?> GetByPhoneAndSalonAsync(string phone, Guid salonId)
            => await _context.Clients
                .FirstOrDefaultAsync(c => c.Phone == phone && c.SalonId == salonId);

        public async Task<Client?> GetByIdAsync(Guid id)
            => await _context.Clients.FirstOrDefaultAsync(c => c.Id == id);

        public async Task AddAsync(Client client)
        {
            await _context.Clients.AddAsync(client);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Client client)
            => await _context.SaveChangesAsync();
    }
}
