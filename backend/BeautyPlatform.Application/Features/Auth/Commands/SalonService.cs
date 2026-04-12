using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Application.Features.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Commands
{
    public class SalonService : ISalonService
    {
        private readonly ISalonRepository _repository;
        private readonly IUserRepository _userRepository; // додати

        public SalonService(
            ISalonRepository repository,
            IUserRepository userRepository) // додати
        {
            _repository = repository;
            _userRepository = userRepository; // додати
        }

        public async Task<Guid> CreateAsync(CreateSalonCommand command, Guid ownerId)
        {
            var existing = await _repository.GetByOwnerIdAsync(ownerId);
            if (existing != null)
                throw new InvalidOperationException("User already has a salon.");

            var address = Address.Create(command.Street, command.City);
            var salon = new Salon(ownerId, command.Name, command.Phone, address);
            await _repository.AddAsync(salon);

            // Прив'язуємо салон до юзера після створення
            var user = await _userRepository.GetByIdAsync(ownerId)
                ?? throw new KeyNotFoundException("User not found.");

            user.AssignToSalon(salon.Id);
            await _userRepository.UpdateAsync(user);

            return salon.Id;
        }

        public async Task UpdateAsync(Guid salonId, UpdateSalonCommand command, Guid ownerId)
        {
            var salon = await GetSalonAndEnsureOwnership(salonId, ownerId);
            var address = Address.Create(command.Street, command.City);
            salon.Update(command.Name, command.Phone, address);
            await _repository.UpdateAsync(salon);
        }

        public async Task<SalonDto> GetByIdAsync(Guid salonId, Guid ownerId)
        {
            var salon = await GetSalonAndEnsureOwnership(salonId, ownerId);
            return MapToDto(salon);
        }

        public async Task<SalonSettingsDto> GetSettingsAsync(Guid salonId, Guid ownerId)
        {
            var salon = await GetSalonAndEnsureOwnership(salonId, ownerId);
            return MapToSettingsDto(salon.Settings);
        }

        public async Task UpdateSettingsAsync(Guid salonId, UpdateSalonSettingsCommand command, Guid ownerId)
        {
            var salon = await GetSalonAndEnsureOwnership(salonId, ownerId);
            salon.UpdateSettings(command.OpeningTime, command.ClosingTime, command.SlotDurationMinutes);
            await _repository.UpdateAsync(salon);
        }

        public async Task AddRegularDayOffAsync(Guid salonId, DayOfWeek dayOfWeek, Guid ownerId)
        {
            Console.WriteLine($"=== AddRegularDayOff START ===");
            Console.WriteLine($"SalonId: {salonId}, DayOfWeek: {dayOfWeek}, OwnerId: {ownerId}");

            var salon = await GetSalonAndEnsureOwnership(salonId, ownerId);
            Console.WriteLine($"Salon found: {salon.Id}");
            Console.WriteLine($"Settings null: {salon.Settings == null}");
            Console.WriteLine($"Settings Id: {salon.Settings?.Id}");
            Console.WriteLine($"Settings SalonId: {salon.Settings?.SalonId}");
            Console.WriteLine($"RegularDaysOff count: {salon.Settings?.RegularDaysOff?.Count}");

            salon.Settings.AddRegularDayOff(dayOfWeek);
            Console.WriteLine($"After add - RegularDaysOff count: {salon.Settings.RegularDaysOff.Count}");

            await _repository.UpdateAsync(salon);
            Console.WriteLine($"=== AddRegularDayOff END ===");
        }

        public async Task RemoveRegularDayOffAsync(Guid salonId, DayOfWeek dayOfWeek, Guid ownerId)
        {
            var salon = await GetSalonAndEnsureOwnership(salonId, ownerId);
            salon.Settings.RemoveRegularDayOff(dayOfWeek);
            await _repository.UpdateAsync(salon);
        }

        public async Task AddSpecialDayOffAsync(Guid salonId, DateTime date, string? reason, Guid ownerId)
        {
            var salon = await GetSalonAndEnsureOwnership(salonId, ownerId);
            salon.Settings.AddSpecialDayOff(date, reason);
            await _repository.UpdateAsync(salon);
        }

        public async Task RemoveSpecialDayOffAsync(Guid salonId, Guid dayOffId, Guid ownerId)
        {
            var salon = await GetSalonAndEnsureOwnership(salonId, ownerId);
            salon.Settings.RemoveSpecialDayOff(dayOffId);
            await _repository.UpdateAsync(salon);
        }

        public async Task AddBreakAsync(Guid salonId, TimeSpan start, TimeSpan end, Guid ownerId)
        {
            var salon = await GetSalonAndEnsureOwnership(salonId, ownerId);
            salon.AddBreak(start, end);
            await _repository.UpdateAsync(salon);
        }

        // --- Приватні допоміжні методи ---

        private async Task<Salon> GetSalonAndEnsureOwnership(Guid salonId, Guid ownerId)
        {
            var salon = await _repository.GetByIdAsync(salonId);
            if (salon == null)
                throw new KeyNotFoundException($"Salon {salonId} not found");
            salon.EnsureOwnership(ownerId);
            return salon;
        }

        private static SalonDto MapToDto(Salon salon) => new()
        {
            Id = salon.Id,
            Name = salon.Name,
            Phone = salon.Phone,
            Address = new AddressDto { Street = salon.Address.Street, City = salon.Address.City },
            Currency = salon.Currency,
            CreatedAt = salon.CreatedAt
        };

        // MapToSettingsDto — оновлений маппінг
        private static SalonSettingsDto MapToSettingsDto(SalonSettings settings) => new()
        {
            OpeningTime = settings.OpeningTime,
            ClosingTime = settings.ClosingTime,
            DefaultSlotDurationMinutes = settings.DefaultSlotDurationMinutes,
            Timezone = settings.Timezone,
            BreakTimes = settings.BreakTimes
                .Select(b => new BreakTimeDto { Start = b.Start, End = b.End })
                .ToList(),
            RegularDaysOff = settings.RegularDaysOff
                .Select(r => new RegularDayOffDto { Id = r.Id, DayOfWeek = r.DayOfWeek })
                .ToList(),
            SpecialDaysOff = settings.SpecialDaysOff
                .Select(s => new SpecialDayOffDto { Id = s.Id, Date = s.Date, Reason = s.Reason })
                .ToList()
        };
    }
}
