using CRMService.Application.Features.Employess.Commands.Employee_Commands;
using CRMService.Application.Features.Employess.DTOs;
using CRMService.Application.Features.Scheduling.Commands;
using CRMService.Application.Features.Scheduling.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace CRMService.Application.Features.Employess.Interfaces
{
    public interface IEmployeeService
    {
        Task<Guid> CreateAsync(CreateEmployeeCommand command, Guid salonId, Guid ownerId);
        Task UpdateAsync(Guid employeeId, UpdateEmployeeCommand command, Guid salonId, Guid ownerId);
        Task ActivateAsync(Guid employeeId, Guid salonId, Guid ownerId);
        Task DeactivateAsync(Guid employeeId, Guid salonId, Guid ownerId);
        Task ArchiveAsync(Guid employeeId, Guid salonId, Guid ownerId);
        Task UnarchiveAsync(Guid employeeId, Guid salonId, Guid ownerId);
        Task DeleteEmployeeAsync(Guid employeeId, Guid salonId, Guid ownerId);
        Task<EmployeeDto> GetByIdAsync(Guid employeeId, Guid salonId, Guid ownerId);
        Task<List<EmployeeListItemDto>> GetBySalonAsync(Guid salonId, Guid ownerId);

        Task RemoveServiceAsync(Guid employeeId, Guid serviceId, Guid salonId, Guid ownerId);

        Task SetScheduleAsync(Guid employeeId, List<ScheduleItemCommand> schedule, Guid salonId, Guid ownerId);
        Task<Guid> RegisterSelfAsEmployeeAsync(RegisterSelfAsEmployeeCommand command, Guid salonId, Guid ownerId);
        Task AssignServiceAsync(Guid employeeId, Guid serviceId, decimal? priceOverride, int? systemDurationOverride, int? clientDurationOverride, Guid salonId, Guid ownerId);
        Task UpdateServiceOverridesAsync(Guid id, Guid serviceId, decimal? priceOverride, int? systemDurationOverride, int? clientDurationOverride, Guid salonId, Guid ownerId);
        Task<ScheduleConstraintsDto> GetScheduleConstraintsAsync(Guid employeeId, Guid salonId, Guid ownerId);

        Task<List<EmployeeListItemDto>> GetBySalonPublicAsync(Guid salonId);
        Task<List<PublicEmployeeForServiceDto>> GetByServicePublicAsync(Guid salonId, Guid serviceId);
        Task<List<EmployeeScheduleSummaryDto>> GetAllSchedulesAsync(Guid salonId, Guid ownerId);

        // ── Master cabinet — authorized by userId, not ownerId ──────────────
        Task<EmployeeDto> GetMyProfileAsync(Guid salonId, Guid userId);
        Task<ScheduleConstraintsDto> GetMyScheduleConstraintsAsync(Guid salonId, Guid userId);
        Task SetMyScheduleAsync(Guid salonId, Guid userId, List<ScheduleItemCommand> schedule);
        Task<List<EmployeeBreakDto>> GetMyBreaksAsync(Guid salonId, Guid userId, DateOnly date);
        Task<Guid> AddMyBreakAsync(Guid salonId, Guid userId, CreateBreakCommand command);
        Task DeleteMyBreakAsync(Guid salonId, Guid userId, Guid breakId);
    }
}
