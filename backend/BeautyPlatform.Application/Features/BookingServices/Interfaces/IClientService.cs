using CRMService.Application.Features.BookingServices.DTOs;

namespace CRMService.Application.Features.BookingServices.Interfaces
{
    public interface IClientService
    {
        Task<List<ClientDto>> SearchAsync(Guid salonId, string? phone, Guid ownerId);
    }
}
