using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employess.Commands.Employee_Commands;
using CRMService.Application.Features.Employess.Interfaces;
using CRMService.Application.Features.Scheduling.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/employees")]
    public class EmployeeController : ApiControllerBase
    {
        private readonly IEmployeeService _employeeService;

        public EmployeeController(IEmployeeService employeeService)
        {
            _employeeService = employeeService;
        }

        // GET api/salons/{salonId}/employees
        //[HttpGet]
        //public async Task<IActionResult> GetAll(Guid salonId)
        //{
        //    var ownerId = GetUserId();
        //    var employees = await _employeeService.GetBySalonAsync(salonId, ownerId);
        //    return Ok(employees);
        //}

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAll(Guid salonId)
        {
            // ✓ без GetUserId()
            var employees = await _employeeService.GetBySalonPublicAsync(salonId);
            return Ok(employees);
        }

        // ── Master cabinet (/me) endpoints ─────────────────────────────────────
        // ВАЖЛИВО: ці маршрути йдуть ДО {id}, щоб "me" не парсилось як Guid.

        // GET /api/salons/{salonId}/employees/me
        [HttpGet("me")]
        public async Task<IActionResult> GetMyProfile(Guid salonId)
        {
            var userId = GetUserId();
            var result = await _employeeService.GetMyProfileAsync(salonId, userId);
            return Ok(result);
        }

        // GET /api/salons/{salonId}/employees/me/schedule-constraints
        [HttpGet("me/schedule-constraints")]
        public async Task<IActionResult> GetMyScheduleConstraints(Guid salonId)
        {
            var userId = GetUserId();
            var result = await _employeeService.GetMyScheduleConstraintsAsync(salonId, userId);
            return Ok(result);
        }

        // PUT /api/salons/{salonId}/employees/me/schedule
        [HttpPut("me/schedule")]
        public async Task<IActionResult> SetMySchedule(
            Guid salonId,
            [FromBody] List<ScheduleItemCommand> schedule)
        {
            var userId = GetUserId();
            await _employeeService.SetMyScheduleAsync(salonId, userId, schedule);
            return NoContent();
        }

        // GET /api/salons/{salonId}/employees/me/breaks?date=2026-05-05
        [HttpGet("me/breaks")]
        public async Task<IActionResult> GetMyBreaks(
            Guid salonId,
            [FromQuery] string? date)
        {
            if (!DateOnly.TryParse(date, out var parsedDate))
                return BadRequest("Invalid or missing date. Use format YYYY-MM-DD.");

            var userId = GetUserId();
            var result = await _employeeService.GetMyBreaksAsync(salonId, userId, parsedDate);
            return Ok(result);
        }

        // POST /api/salons/{salonId}/employees/me/breaks
        [HttpPost("me/breaks")]
        public async Task<IActionResult> AddMyBreak(
            Guid salonId,
            [FromBody] CreateBreakCommand command)
        {
            var userId = GetUserId();
            var id = await _employeeService.AddMyBreakAsync(salonId, userId, command);
            return CreatedAtAction(nameof(GetMyBreaks),
                new { salonId, date = command.Date.ToString("yyyy-MM-dd") }, new { id });
        }

        // DELETE /api/salons/{salonId}/employees/me/breaks/{breakId}
        [HttpDelete("me/breaks/{breakId}")]
        public async Task<IActionResult> DeleteMyBreak(Guid salonId, Guid breakId)
        {
            var userId = GetUserId();
            await _employeeService.DeleteMyBreakAsync(salonId, userId, breakId);
            return NoContent();
        }

        // ── GET /api/salons/{salonId}/employees/schedules ──────────────────────

        // GET /api/salons/{salonId}/employees/schedules
        [HttpGet("schedules")]
        public async Task<IActionResult> GetSchedules(Guid salonId)
        {
            var ownerId = GetUserId();
            var schedules = await _employeeService.GetAllSchedulesAsync(salonId, ownerId);
            return Ok(schedules);
        }

        // GET /api/salons/{salonId}/employees/{employeeId}/schedule-constraints
        [HttpGet("{id}/schedule-constraints")]
        [AllowAnonymous]
        public async Task<IActionResult> GetScheduleConstraints(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            var result = await _employeeService.GetScheduleConstraintsAsync(id, salonId, ownerId);
            return Ok(result);
        }

        // GET api/salons/{salonId}/employees/{id}
        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetById(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            var employee = await _employeeService.GetByIdAsync(id, salonId, ownerId);
            return Ok(employee);
        }

        // POST api/salons/{salonId}/employees
        [HttpPost]
        public async Task<IActionResult> Create(Guid salonId, CreateEmployeeCommand command)
        {
            var ownerId = GetUserId();
            var id = await _employeeService.CreateAsync(command, salonId, ownerId);
            return CreatedAtAction(nameof(GetById), new { salonId, id }, new { id });
        }

        // POST /api/salons/{salonId}/employees/self
        [HttpPost("self")]
        public async Task<IActionResult> RegisterSelf(
            Guid salonId,
            RegisterSelfAsEmployeeCommand command)
        {
            var ownerId = GetUserId();
            var id = await _employeeService.RegisterSelfAsEmployeeAsync(command, salonId, ownerId);
            return CreatedAtAction(nameof(GetById), new { salonId, id }, new { id });
        }

        // PUT api/salons/{salonId}/employees/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid salonId, Guid id, UpdateEmployeeCommand command)
        {
            var ownerId = GetUserId();
            await _employeeService.UpdateAsync(id, command, salonId, ownerId);
            return NoContent();
        }

        // PATCH api/salons/{salonId}/employees/{id}/activate
        [HttpPatch("{id}/activate")]
        public async Task<IActionResult> Activate(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            await _employeeService.ActivateAsync(id, salonId, ownerId);
            return NoContent();
        }

        // PATCH api/salons/{salonId}/employees/{id}/deactivate
        [HttpPatch("{id}/deactivate")]
        public async Task<IActionResult> Deactivate(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            await _employeeService.DeactivateAsync(id, salonId, ownerId);
            return NoContent();
        }

        // PATCH api/salons/{salonId}/employees/{id}/archive
        [HttpPatch("{id}/archive")]
        public async Task<IActionResult> Archive(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            await _employeeService.ArchiveAsync(id, salonId, ownerId);
            return NoContent();
        }

        // PATCH api/salons/{salonId}/employees/{id}/unarchive
        [HttpPatch("{id}/unarchive")]
        public async Task<IActionResult> Unarchive(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            await _employeeService.UnarchiveAsync(id, salonId, ownerId);
            return NoContent();
        }

        // DELETE api/salons/{salonId}/employees/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            await _employeeService.DeleteEmployeeAsync(id, salonId, ownerId);
            return NoContent();
        }

        // GET api/salons/{salonId}/employees/by-service/{serviceId}  [public]
        [HttpGet("by-service/{serviceId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetByService(Guid salonId, Guid serviceId)
        {
            var employees = await _employeeService.GetByServicePublicAsync(salonId, serviceId);
            return Ok(employees);
        }

        // ── Employee ↔ Service ─────────────────────────────────────

        // POST api/salons/{salonId}/employees/{id}/services/{serviceId}
        [HttpPost("{id}/services/{serviceId}")]
        public async Task<IActionResult> AssignService(
            Guid salonId,
            Guid id,
            Guid serviceId,
            [FromBody] AssignServiceRequest? request = null)
        {
            var ownerId = GetUserId();
            await _employeeService.AssignServiceAsync(id, serviceId, request?.PriceOverride, request?.systemDurationOverride, request?.clientDurationOverride, salonId, ownerId);
            return NoContent();
        }

        // DELETE api/salons/{salonId}/employees/{id}/services/{serviceId}
        [HttpDelete("{id}/services/{serviceId}")]
        public async Task<IActionResult> RemoveService(Guid salonId, Guid id, Guid serviceId)
        {
            var ownerId = GetUserId();
            await _employeeService.RemoveServiceAsync(id, serviceId, salonId, ownerId);
            return NoContent();
        }

        [HttpPatch("{id}/services/{serviceId}/overrides")]
        public async Task<IActionResult> UpdateServiceOverrides(
            Guid salonId, Guid id, Guid serviceId,
            [FromBody] UpdateServiceOverridesRequest request)
        {
            var ownerId = GetUserId();
            await _employeeService.UpdateServiceOverridesAsync(
                id, serviceId,
                request.PriceOverride,
                request.SystemDurationOverride,
                request.ClientDurationOverride,
                salonId, ownerId);
            return NoContent();
        }

        // ── Schedule ───────────────────────────────────────────────

        // PUT api/salons/{salonId}/employees/{id}/schedule
        [HttpPut("{id}/schedule")]
        public async Task<IActionResult> SetSchedule(
            Guid salonId,
            Guid id,
            [FromBody] List<ScheduleItemCommand> schedule)
        {
            var ownerId = GetUserId();
            await _employeeService.SetScheduleAsync(id, schedule, salonId, ownerId);
            return NoContent();
        }
    }

    // ── Request моделі (прості, не варто виносити окремо) ──────────
    public record AssignServiceRequest(decimal? PriceOverride, int? systemDurationOverride, int? clientDurationOverride);
    public record UpdateServicePriceRequest(decimal? PriceOverride);
    public record UpdateServiceOverridesRequest(
    decimal? PriceOverride,
    int? SystemDurationOverride,
    int? ClientDurationOverride);
}