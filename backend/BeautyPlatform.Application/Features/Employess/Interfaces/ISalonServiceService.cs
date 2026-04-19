using CRMService.Application.Features.Employess.Commands.Service_Commands;
using CRMService.Application.Features.Employess.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.Interfaces
{
    public interface ISalonServiceService
    {
        Task<Guid> CreateAsync(CreateServiceCommand command, Guid salonId, Guid ownerId);
        Task UpdateAsync(Guid serviceId, UpdateServiceCommand command, Guid salonId, Guid ownerId);
        Task DeactivateAsync(Guid serviceId, Guid salonId, Guid ownerId);
        Task<ServiceDto> GetByIdAsync(Guid serviceId, Guid salonId, Guid ownerId);
        Task<List<ServiceListItemDto>> GetBySalonAsync(Guid salonId, Guid ownerId);

        Task<ServiceImageDto> AddImageAsync(Guid serviceId, AddServiceImageCommand command, Guid salonId, Guid ownerId);
        Task RemoveImageAsync(Guid serviceId, Guid imageId, Guid salonId, Guid ownerId);
    }
}
