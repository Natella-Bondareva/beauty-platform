using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.DTOs;

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Interfaces
{
    public interface ISalonService
    {
        Task<Guid> CreateAsync(CreateSalonCommand command, Guid ownerId);
        Task UpdateAsync(Guid salonId, UpdateSalonCommand command, Guid ownerId);
        Task<SalonDto> GetByIdAsync(Guid salonId, Guid ownerId);

        Task<SalonSettingsDto> GetSettingsAsync(Guid salonId, Guid ownerId);
        Task UpdateSettingsAsync(Guid salonId, UpdateSalonSettingsCommand command, Guid ownerId);
        Task AddRegularDayOffAsync(Guid salonId, DayOfWeek dayOfWeek, Guid ownerId);
        Task RemoveRegularDayOffAsync(Guid salonId, DayOfWeek dayOfWeek, Guid ownerId);
        Task AddSpecialDayOffAsync(Guid salonId, DateTime date, string? reason, Guid ownerId);
        Task RemoveSpecialDayOffAsync(Guid salonId, Guid dayOffId, Guid ownerId); 
        
        Task AddBreakAsync(Guid salonId, TimeSpan start, TimeSpan end, Guid ownerId);
    }
}
