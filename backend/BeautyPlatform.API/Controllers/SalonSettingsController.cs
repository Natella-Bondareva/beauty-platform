using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/settings")]
    public class SalonSettingsController : ApiControllerBase
    {
        private readonly ISalonService _service;

        public SalonSettingsController(ISalonService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get(Guid salonId)
        {
            var ownerId = GetUserId();
            var result = await _service.GetSettingsAsync(salonId, ownerId);
            return Ok(result);
        }

        [HttpPut]
        public async Task<IActionResult> Update(Guid salonId, UpdateSalonSettingsCommand command)
        {
            var ownerId = GetUserId();
            await _service.UpdateSettingsAsync(salonId, command, ownerId);
            return NoContent();
        }

        [HttpPost("regular-days-off")]
        public async Task<IActionResult> AddRegularDayOff(Guid salonId, AddRegularDayOffCommand command)
        {
            var ownerId = GetUserId();
            await _service.AddRegularDayOffAsync(salonId, command.DayOfWeek, ownerId);
            return NoContent();
        }

        [HttpDelete("regular-days-off/{dayOfWeek}")]
        public async Task<IActionResult> RemoveRegularDayOff(Guid salonId, DayOfWeek dayOfWeek)
        {
            var ownerId = GetUserId();
            await _service.RemoveRegularDayOffAsync(salonId, dayOfWeek, ownerId);
            return NoContent();
        }

        [HttpPost("special-days-off")]
        public async Task<IActionResult> AddSpecialDayOff(Guid salonId, AddSpecialDayOffCommand command)
        {
            var ownerId = GetUserId();
            await _service.AddSpecialDayOffAsync(salonId, command.Date, command.Reason, ownerId);
            return NoContent();
        }

        [HttpDelete("special-days-off/{id}")]
        public async Task<IActionResult> RemoveSpecialDayOff(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            await _service.RemoveSpecialDayOffAsync(salonId, id, ownerId);
            return NoContent();
        }

        [HttpPost("breaks")]
        public async Task<IActionResult> AddBreak(Guid salonId, AddBreakCommand command)
        {
            var ownerId = GetUserId();
            await _service.AddBreakAsync(salonId, command.Start, command.End, ownerId);
            return NoContent();
        }
    }
}
