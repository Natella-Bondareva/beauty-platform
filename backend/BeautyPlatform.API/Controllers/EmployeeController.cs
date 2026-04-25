using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employess.Commands.Employee_Commands;
using CRMService.Application.Features.Employess.Interfaces;
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
        [HttpGet]
        public async Task<IActionResult> GetAll(Guid salonId)
        {
            var ownerId = GetUserId();
            var employees = await _employeeService.GetBySalonAsync(salonId, ownerId);
            return Ok(employees);
        }

        // GET /api/salons/{salonId}/employees/{employeeId}/schedule-constraints
        [HttpGet("{id}/schedule-constraints")]
        [Authorize]
        public async Task<IActionResult> GetScheduleConstraints(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            var result = await _employeeService.GetScheduleConstraintsAsync(id, salonId, ownerId);
            return Ok(result);
        }

        // GET api/salons/{salonId}/employees/{id}
        [HttpGet("{id}")]
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

        // DELETE api/salons/{salonId}/employees/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deactivate(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            await _employeeService.DeactivateAsync(id, salonId, ownerId);
            return NoContent();
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