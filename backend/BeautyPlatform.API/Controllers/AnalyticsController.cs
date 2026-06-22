using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/analytics")]
    public class AnalyticsController : ApiControllerBase
    {
        private readonly IAnalyticsService _service;

        public AnalyticsController(IAnalyticsService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get(
            Guid salonId,
            [FromQuery] DateTime from,
            [FromQuery] DateTime to)
        {
            // Якщо дати не передані — поточний місяць за замовчуванням
            var dateFrom = from == default
                ? new DateTime(DateTime.UtcNow.Year, DateTime.UtcNow.Month, 1, 0, 0, 0, DateTimeKind.Utc)
                : DateTime.SpecifyKind(from, DateTimeKind.Utc);
            var dateTo = to == default ? DateTime.UtcNow : DateTime.SpecifyKind(to, DateTimeKind.Utc);

            var result = await _service.GetAsync(salonId, dateFrom, dateTo, GetUserId());
            return Ok(result);
        }
    }
}
