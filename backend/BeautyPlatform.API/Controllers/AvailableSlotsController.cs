using CRMService.Application.Features.Scheduling.Interfaces;
using CRMService.Application.Features.Scheduling.Queries;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [ApiController]
    [Route("api/salons/{salonId}")]
    public class AvailableSlotsController : ApiControllerBase
    {
        private readonly IAvailableSlotsService _slotsService;

        public AvailableSlotsController(IAvailableSlotsService slotsService)
        {
            _slotsService = slotsService;
        }

        /// <summary>
        /// Сценарій 1 — всі майстри по послузі.
        /// GET /api/salons/{salonId}/available-slots?serviceId=X&date=2026-04-21
        /// </summary>
        [HttpGet("available-slots")]
        [AllowAnonymous]
        public async Task<IActionResult> GetAvailableSlots(
            Guid salonId,
            [FromQuery] Guid? serviceId,
            [FromQuery] string? date)
        {
            if (!ParseDate(date, out var parsedDate, out var dateError))
                return BadRequest(dateError);

            if (!serviceId.HasValue || serviceId == Guid.Empty)
                return BadRequest("serviceId is required for this endpoint.");

            var query = new GetAvailableSlotsQuery(salonId, serviceId.Value, parsedDate);
            var slots = await _slotsService.GetAllAvailableSlotsAsync(query);
            return Ok(slots);
        }

        /// <summary>
        /// Сценарій 2 — всі слоти майстра (без послуги, для шахматки).
        /// GET /api/salons/{salonId}/employees/{employeeId}/available-slots?date=2026-04-21
        ///
        /// Сценарій 3 — слоти майстра по конкретній послузі.
        /// GET /api/salons/{salonId}/employees/{employeeId}/available-slots?serviceId=X&date=2026-04-21
        /// </summary>
        [HttpGet("employees/{employeeId}/available-slots")]
        [AllowAnonymous]
        public async Task<IActionResult> GetEmployeeAvailableSlots(
            Guid salonId,
            Guid employeeId,
            [FromQuery] Guid? serviceId,
            [FromQuery] string? date)
        {
            if (!ParseDate(date, out var parsedDate, out var dateError))
                return BadRequest(dateError);

            // Сценарій 3 — є serviceId → конкретна послуга
            if (serviceId.HasValue && serviceId != Guid.Empty)
            {
                var query = new GetEmployeeAvailableSlotsQuery(
                    salonId, serviceId.Value, employeeId, parsedDate);

                var result = await _slotsService.GetEmployeeAvailableSlotsAsync(query);

                if (result is null)
                    return NotFound("Employee does not provide this service.");

                return Ok(result);
            }

            // Сценарій 2 — без serviceId → всі слоти майстра
            {
                // ✓ GetEmployeeAllSlotsQuery — має SalonId, EmployeeId, Date
                var query = new GetEmployeeAllSlotsQuery(salonId, employeeId, parsedDate);
                var result = await _slotsService.GetEmployeeAllSlotsAsync(query);

                if (result is null)
                    return NotFound("Employee not found or inactive.");

                return Ok(result);
            }
        }

        // ── Helper ─────────────────────────────────────────────────

        private static bool ParseDate(
            string? date,
            out DateOnly parsedDate,
            out string? error)
        {
            parsedDate = default;
            error = null;

            if (string.IsNullOrWhiteSpace(date))
            {
                error = "date is required. Format: yyyy-MM-dd (e.g. 2026-04-21)";
                return false;
            }

            if (!DateOnly.TryParseExact(date, "yyyy-MM-dd", out parsedDate))
            {
                error = "Invalid date format. Use yyyy-MM-dd (e.g. 2026-04-21)";
                return false;
            }

            return true;
        }
    }
}