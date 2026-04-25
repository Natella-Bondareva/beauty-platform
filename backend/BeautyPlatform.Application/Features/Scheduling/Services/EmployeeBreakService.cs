using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Scheduling.Commands;
using CRMService.Application.Features.Scheduling.DTOs;
using CRMService.Application.Features.Scheduling.Interfaces;
using CRMService.Domain.Entities;

namespace CRMService.Application.Features.Scheduling.Services
{
    public class EmployeeBreakService : IEmployeeBreakService
    {
        private readonly IEmployeeBreakRepository _breakRepo;
        private readonly IEmployeeRepository _employeeRepo;
        private readonly ISalonRepository _salonRepo;

        public EmployeeBreakService(
            IEmployeeBreakRepository breakRepo,
            IEmployeeRepository employeeRepo,
            ISalonRepository salonRepo)
        {
            _breakRepo = breakRepo;
            _employeeRepo = employeeRepo;
            _salonRepo = salonRepo;
        }

        public async Task<Guid> CreateAsync(
            Guid employeeId,
            CreateBreakCommand command,
            Guid salonId,
            Guid ownerId)
        {
            await EnsureAccess(employeeId, salonId, ownerId);

            // ✓ Отримуємо розклад майстра на цей день
            var employee = await _employeeRepo.GetByIdWithScheduleAsync(employeeId)
                ?? throw new KeyNotFoundException("Employee not found.");

            var schedule = employee.Schedules
                .FirstOrDefault(s => s.DayOfWeek == command.Date.DayOfWeek);

            // Якщо майстер не працює в цей день — перерва не має сенсу
            if (schedule is null || !schedule.IsWorking)
                throw new InvalidOperationException(
                    "Cannot add a break on a non-working day.");

            // Перерва має бути в межах робочого часу майстра
            if (command.StartTime < schedule.StartTime ||
                command.EndTime > schedule.EndTime)
                throw new InvalidOperationException(
                    $"Break must be within employee working hours " +
                    $"({schedule.StartTime:hh\\:mm} - {schedule.EndTime:hh\\:mm}).");

            // Перевірка перетину з існуючими перервами
            var existing = await _breakRepo.GetByEmployeeAndDateAsync(employeeId, command.Date);
            if (existing.Any(b => b.OverlapsWith(command.StartTime, command.EndTime)))
                throw new InvalidOperationException("Break overlaps with an existing break.");

            var employeeBreak = new EmployeeBreak(
                employeeId,
                command.Date,
                command.StartTime,
                command.EndTime,
                command.Reason);

            await _breakRepo.AddAsync(employeeBreak);
            return employeeBreak.Id;
        }

        public async Task UpdateAsync(
            Guid breakId,
            UpdateBreakCommand command,
            Guid salonId,
            Guid ownerId)
        {
            var employeeBreak = await GetBreakAndEnsureAccess(breakId, salonId, ownerId);

            // Перевіряємо перетин (виключаємо поточну перерву)
            var existing = await _breakRepo.GetByEmployeeAndDateAsync(employeeBreak.EmployeeId, employeeBreak.Date);
            var hasOverlap = existing
                .Where(b => b.Id != breakId)
                .Any(b => b.OverlapsWith(command.StartTime, command.EndTime));

            if (hasOverlap)
                throw new InvalidOperationException("Break overlaps with an existing break.");

            employeeBreak.Update(command.StartTime, command.EndTime, command.Reason);
            await _breakRepo.UpdateAsync(employeeBreak);
        }

        public async Task DeleteAsync(Guid breakId, Guid salonId, Guid ownerId)
        {
            var employeeBreak = await GetBreakAndEnsureAccess(breakId, salonId, ownerId);
            await _breakRepo.DeleteAsync(employeeBreak);
        }

        public async Task<List<EmployeeBreakDto>> GetByEmployeeAndDateAsync(
            Guid employeeId,
            DateOnly date,
            Guid salonId,
            Guid ownerId)
        {
            await EnsureAccess(employeeId, salonId, ownerId);
            var breaks = await _breakRepo.GetByEmployeeAndDateAsync(employeeId, date);
            return breaks.Select(MapToDto).ToList();
        }

        // ── Helpers ────────────────────────────────────────────────

        private async Task EnsureAccess(Guid employeeId, Guid salonId, Guid ownerId)
        {
            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);

            var employee = await _employeeRepo.GetByIdAsync(employeeId)
                ?? throw new KeyNotFoundException("Employee not found.");
            employee.EnsureBelongsToSalon(salonId);
        }

        private async Task<EmployeeBreak> GetBreakAndEnsureAccess(
            Guid breakId,
            Guid salonId,
            Guid ownerId)
        {
            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);

            var employeeBreak = await _breakRepo.GetByIdAsync(breakId)
                ?? throw new KeyNotFoundException("Break not found.");

            var employee = await _employeeRepo.GetByIdAsync(employeeBreak.EmployeeId)
                ?? throw new KeyNotFoundException("Employee not found.");
            employee.EnsureBelongsToSalon(salonId);

            return employeeBreak;
        }

        private static EmployeeBreakDto MapToDto(EmployeeBreak b) => new()
        {
            Id = b.Id,
            EmployeeId = b.EmployeeId,
            Date = b.Date,
            StartTime = b.StartTime,
            EndTime = b.EndTime,
            Reason = b.Reason
        };
    }
}