using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.BookingServices.Commands;
using CRMService.Application.Features.BookingServices.DTOs;
using CRMService.Application.Features.BookingServices.Filters;
using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Application.Features.BookingServices.Responses;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Scheduling.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;

namespace CRMService.Application.Features.BookingServices.Services
{
    public class BookingFieldService : IBookingFieldService
    {
        private readonly IBookingFieldRepository _repository;
        private readonly ISalonRepository _salonRepository;

        public BookingFieldService(
            IBookingFieldRepository repository,
            ISalonRepository salonRepository)
        {
            _repository = repository;
            _salonRepository = salonRepository;
        }

        public async Task<List<BookingFieldDto>> GetBySalonAsync(Guid salonId, Guid ownerId)
        {
            await EnsureOwnership(salonId, ownerId);
            var fields = await _repository.GetBySalonIdAsync(salonId);
            return fields.Select(MapToDto).ToList();
        }

        // Ключовий метод — збирає поля з трьох scope для клієнта
        public async Task<List<BookingFieldDto>> GetForBookingAsync(
            Guid salonId,
            Guid? serviceId,
            Guid? masterId)
        {
            var allFields = await _repository.GetBySalonIdAsync(salonId);

            var relevant = allFields
                .Where(f => f.IsActive)
                .Where(f =>
                    f.Scope == FieldScope.Salon ||
                    (f.Scope == FieldScope.Service && f.TargetId == serviceId) ||
                    (f.Scope == FieldScope.Master && f.TargetId == masterId))
                .OrderBy(f => f.Order)
                .Select(MapToDto)
                .ToList();

            return relevant;
        }

        public async Task<Guid> CreateAsync(
            Guid salonId,
            CreateBookingFieldCommand command,
            Guid ownerId)
        {
            await EnsureOwnership(salonId, ownerId);

            var field = BookingField.Create(
                salonId,
                command.Label,
                command.Type,
                command.Scope,
                command.IsRequired,
                command.Order,
                command.TargetId,
                command.Placeholder
            );

            foreach (var option in command.Options)
                field.AddOption(option);

            await _repository.AddAsync(field);
            return field.Id;
        }

        public async Task UpdateAsync(
            Guid fieldId,
            UpdateBookingFieldCommand command,
            Guid ownerId)
        {
            var field = await GetFieldAndEnsureOwnership(fieldId, ownerId);
            field.Update(command.Label, command.IsRequired, command.Placeholder);
            await _repository.UpdateAsync(field);
        }

        public async Task DeleteAsync(Guid fieldId, Guid ownerId)
        {
            var field = await GetFieldAndEnsureOwnership(fieldId, ownerId);
            field.Deactivate();
            await _repository.UpdateAsync(field);
        }

        private async Task EnsureOwnership(Guid salonId, Guid ownerId)
        {
            var salon = await _salonRepository.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);
        }

        private async Task<BookingField> GetFieldAndEnsureOwnership(Guid fieldId, Guid ownerId)
        {
            var field = await _repository.GetByIdAsync(fieldId)
                ?? throw new KeyNotFoundException("Field not found.");
            await EnsureOwnership(field.SalonId, ownerId);
            return field;
        }

        private static BookingFieldDto MapToDto(BookingField f) => new()
        {
            Id = f.Id,
            Label = f.Label,
            Placeholder = f.Placeholder,
            Type = f.Type.ToString(),
            Scope = f.Scope.ToString(),
            TargetId = f.TargetId,
            IsRequired = f.IsRequired,
            Order = f.Order,
            Options = f.Options.Select(o => o.Value).ToList()
        };
    }
}