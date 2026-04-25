using CRMService.Application.Features.Scheduling.Commands;
using CRMService.Application.Features.Scheduling.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/employees/{employeeId}/breaks")]
    public class EmployeeBreakController : ApiControllerBase
    {
        private readonly IEmployeeBreakService _breakService;

        public EmployeeBreakController(IEmployeeBreakService breakService)
        {
            _breakService = breakService;
        }

        // GET /api/salons/{salonId}/employees/{employeeId}/breaks?date=2024-04-05
        [HttpGet]
        public async Task<IActionResult> GetBreaks(
            Guid salonId,
            Guid employeeId,
            [FromQuery] DateOnly date)
        {
            var ownerId = GetUserId();
            var breaks = await _breakService.GetByEmployeeAndDateAsync(employeeId, date, salonId, ownerId);
            return Ok(breaks);
        }

        // POST /api/salons/{salonId}/employees/{employeeId}/breaks
        [HttpPost]
        public async Task<IActionResult> Create(
            Guid salonId,
            Guid employeeId,
            CreateBreakCommand command)
        {
            var ownerId = GetUserId();
            var id = await _breakService.CreateAsync(employeeId, command, salonId, ownerId);
            return CreatedAtAction(nameof(GetBreaks),
                new { salonId, employeeId, date = command.Date }, new { id });
        }

        // PUT /api/salons/{salonId}/employees/{employeeId}/breaks/{breakId}
        [HttpPut("{breakId}")]
        public async Task<IActionResult> Update(
            Guid salonId,
            Guid employeeId,
            Guid breakId,
            UpdateBreakCommand command)
        {
            var ownerId = GetUserId();
            await _breakService.UpdateAsync(breakId, command, salonId, ownerId);
            return NoContent();
        }

        // DELETE /api/salons/{salonId}/employees/{employeeId}/breaks/{breakId}
        [HttpDelete("{breakId}")]
        public async Task<IActionResult> Delete(
            Guid salonId,
            Guid employeeId,
            Guid breakId)
        {
            var ownerId = GetUserId();
            await _breakService.DeleteAsync(breakId, salonId, ownerId);
            return NoContent();
        }
    }
}
