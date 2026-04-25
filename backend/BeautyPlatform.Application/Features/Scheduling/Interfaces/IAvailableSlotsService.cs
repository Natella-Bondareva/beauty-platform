using CRMService.Application.Features.Scheduling.DTOs;
using CRMService.Application.Features.Scheduling.Queries;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.Interfaces
{
    public interface IAvailableSlotsService
    {
        /// <summary>Сценарій 1 — всі майстри по послузі</summary>
        Task<List<AvailableSlotDto>> GetAllAvailableSlotsAsync(GetAvailableSlotsQuery query);

        /// <summary>Сценарій 2 — всі слоти майстра без послуги</summary>
        Task<EmployeeAvailabilityDto?> GetEmployeeAllSlotsAsync(GetEmployeeAllSlotsQuery query);

        /// <summary>Сценарій 3 — майстер + конкретна послуга</summary>
        Task<EmployeeAvailabilityDto?> GetEmployeeAvailableSlotsAsync(GetEmployeeAvailableSlotsQuery query);

        Task InvalidateCacheAsync(Guid salonId, Guid serviceId, DateOnly date);
    }
}
