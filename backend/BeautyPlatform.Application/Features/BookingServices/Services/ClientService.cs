using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.BookingServices.DTOs;
using CRMService.Application.Features.BookingServices.Interfaces;

namespace CRMService.Application.Features.BookingServices.Services
{
    public class ClientService : IClientService
    {
        private readonly IClientRepository _clientRepo;
        private readonly ISalonRepository _salonRepo;

        public ClientService(IClientRepository clientRepo, ISalonRepository salonRepo)
        {
            _clientRepo = clientRepo;
            _salonRepo = salonRepo;
        }

        public async Task<List<ClientDto>> SearchAsync(Guid salonId, string? phone, Guid ownerId)
        {
            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);

            if (string.IsNullOrWhiteSpace(phone))
                return new List<ClientDto>();

            var clients = await _clientRepo.SearchByPhoneAsync(salonId, phone.Trim());
            return clients.Select(c => new ClientDto
            {
                Id          = c.Id,
                Phone       = c.Phone,
                FullName    = c.FullName,
                NoShowCount = c.NoShowCount,
                LastVisitAt = c.LastVisitAt,
            }).ToList();
        }
    }
}
