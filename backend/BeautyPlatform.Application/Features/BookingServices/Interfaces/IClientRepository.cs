using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Interfaces
{
    public interface IClientRepository
    {
        Task<Client?> GetByPhoneAndSalonAsync(string phone, Guid salonId);
        Task<Client?> GetByIdAsync(Guid id);
        Task<List<Client>> SearchByPhoneAsync(Guid salonId, string phone, int limit = 5);
        Task AddAsync(Client client);
        Task UpdateAsync(Client client);
    }
}
