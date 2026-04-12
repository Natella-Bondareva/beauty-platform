using CRMService.Application.Features.Auth.Commands;
using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Interfaces
{
    public interface ISalonRepository
    {
        Task<Salon?> GetByIdAsync(Guid id);           // завжди з Settings (eager load)
        Task<Salon?> GetByOwnerIdAsync(Guid ownerId);
        Task AddAsync(Salon salon);
        Task UpdateAsync(Salon salon);
    }
}
