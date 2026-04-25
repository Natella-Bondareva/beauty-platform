using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employess.Commands.Service_Commands;
using CRMService.Application.Features.Employess.DTOs;
using CRMService.Application.Features.Employess.Interfaces;

namespace CRMService.Application.Features.Employees.Services
{
    public class SalonServiceService : ISalonServiceService
    {
        private readonly IServiceRepository _serviceRepo;
        private readonly ISalonRepository _salonRepo;
        private readonly IImageStorageService _imageStorage;

        public SalonServiceService(
            IServiceRepository serviceRepo,
            ISalonRepository salonRepo,
            IImageStorageService imageStorage)
        {
            _serviceRepo = serviceRepo;
            _salonRepo = salonRepo;
            _imageStorage = imageStorage;
        }

        public async Task<Guid> CreateAsync(CreateServiceCommand command, Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);

            // ✓ CategoryId (Guid) замість string Category
            var service = new Domain.Entities.Service(
                salonId,
                command.CategoryId,
                command.Name,
                command.SystemDurationMinutes,
                command.ClientDurationMinutes,
                command.Price,
                command.Description);

            await _serviceRepo.AddAsync(service);
            return service.Id;
        }

        public async Task UpdateAsync(Guid serviceId, UpdateServiceCommand command, Guid salonId, Guid ownerId)
        {
            var service = await GetServiceAndEnsureAccess(serviceId, salonId, ownerId);

            // ✓ Update тепер приймає CategoryId замість string
            service.Update(
                command.CategoryId,
                command.Name,
                command.SystemDurationMinutes,
                command.ClientDurationMinutes,
                command.Price,
                command.Description);

            await _serviceRepo.UpdateAsync(service);
        }

        public async Task DeactivateAsync(Guid serviceId, Guid salonId, Guid ownerId)
        {
            var service = await GetServiceAndEnsureAccess(serviceId, salonId, ownerId);
            service.Deactivate();
            await _serviceRepo.UpdateAsync(service);
        }

        public async Task<ServiceDto> GetByIdAsync(Guid serviceId, Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);
            var service = await _serviceRepo.GetByIdWithImagesAsync(serviceId)
                ?? throw new KeyNotFoundException("Service not found.");
            service.EnsureBelongsToSalon(salonId);
            return MapToDto(service);
        }

        public async Task<List<ServiceListItemDto>> GetBySalonAsync(Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);
            var services = await _serviceRepo.GetBySalonIdAsync(salonId);
            return services.Select(MapToListItemDto).ToList();
        }

        public async Task<ServiceImageDto> AddImageAsync(Guid serviceId, AddServiceImageCommand command, Guid salonId, Guid ownerId)
        {
            var service = await GetServiceAndEnsureAccess(serviceId, salonId, ownerId);

            var imageUrl = await _imageStorage.UploadAsync(
                command.FileStream,
                command.FileName,
                command.ContentType);

            service.AddImage(imageUrl, command.IsCover);
            await _serviceRepo.UpdateAsync(service);

            var addedImage = service.Images.Last();
            return new ServiceImageDto
            {
                Id = addedImage.Id,
                ImageUrl = addedImage.ImageUrl,
                IsCover = addedImage.IsCover,
                SortOrder = addedImage.SortOrder
            };
        }

        public async Task RemoveImageAsync(Guid serviceId, Guid imageId, Guid salonId, Guid ownerId)
        {
            var service = await GetServiceAndEnsureAccess(serviceId, salonId, ownerId);

            var image = service.Images.FirstOrDefault(x => x.Id == imageId)
                ?? throw new KeyNotFoundException("Image not found.");

            await _imageStorage.DeleteAsync(image.ImageUrl);

            service.RemoveImage(imageId);
            await _serviceRepo.UpdateAsync(service);
        }

        // ── Private ────────────────────────────────────────────────

        private async Task EnsureSalonOwnership(Guid salonId, Guid ownerId)
        {
            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);
        }

        private async Task<Domain.Entities.Service> GetServiceAndEnsureAccess(
            Guid serviceId, Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);
            var service = await _serviceRepo.GetByIdWithImagesAsync(serviceId)
                ?? throw new KeyNotFoundException("Service not found.");
            service.EnsureBelongsToSalon(salonId);
            return service;
        }

        private static ServiceDto MapToDto(Domain.Entities.Service s) => new()
        {
            Id = s.Id,
            SalonId = s.SalonId,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name ?? string.Empty,
            Name = s.Name,
            Description = s.Description,
            SystemDurationMinutes = s.SystemDurationMinutes,
            ClientDurationMinutes = s.ClientDurationMinutes,
            Price = s.Price,
            IsActive = s.IsActive,
            Images = s.Images.OrderBy(i => i.SortOrder).Select(i => new ServiceImageDto
            {
                Id = i.Id,
                ImageUrl = i.ImageUrl,
                IsCover = i.IsCover,
                SortOrder = i.SortOrder
            }).ToList(),
            Employees = s.EmployeeServices.Select(es => new ServiceEmployeeDto
            {
                EmployeeId = es.EmployeeId,
                FullName = es.Employee?.FullName ?? string.Empty,
                AvatarUrl = es.Employee?.AvatarUrl,
                EffectivePrice = es.GetEffectivePrice(),
                EffectiveSystemDuration = es.GetEffectiveSystemDuration(),
                EffectiveClientDuration = es.GetEffectiveClientDuration(),
                PriceOverride = es.PriceOverride,
                SystemDurationOverride = es.SystemDurationOverride,
                ClientDurationOverride = es.ClientDurationOverride,
            }).ToList()
        };

        private static ServiceListItemDto MapToListItemDto(Domain.Entities.Service s) => new()
        {
            Id = s.Id,
            CategoryId = s.CategoryId,
            CategoryName = s.Category?.Name ?? string.Empty,
            Name = s.Name,
            SystemDurationMinutes = s.SystemDurationMinutes,
            ClientDurationMinutes = s.ClientDurationMinutes,
            Price = s.Price,
            IsActive = s.IsActive,
            CoverImageUrl = s.Images.FirstOrDefault(i => i.IsCover)?.ImageUrl,
            EmployeesCount = s.EmployeeServices.Count
        };
    }
}