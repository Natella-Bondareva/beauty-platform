using CRMService.Application.Features.Pricing.DTOs;
using CRMService.Application.Features.Pricing.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/subscription")]
    public class SubscriptionController : ApiControllerBase // не ControllerBase
    {
        private readonly ISubscriptionService _service;

        public SubscriptionController(ISubscriptionService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> Get(Guid salonId)
        {
            var result = await _service.GetAsync(salonId, GetUserId());
            return Ok(result);
        }

        // Додати слоти для майстрів
        [HttpPost("masters")]
        public async Task<IActionResult> AddMasterSlots(Guid salonId, AddMasterSlotsRequest request)
        {
            await _service.AddMasterSlotsAsync(salonId, request.Count, request.Months, GetUserId());
            return NoContent();
        }

        [HttpPost("modules")]
        public async Task<IActionResult> AddModule(Guid salonId, AddModuleRequest request)
        {
            await _service.AddModuleAsync(salonId, request.Module, request.Months, GetUserId());
            return NoContent();
        }

        // Payment flow: create payment → fake/real provider → activate module or slots
        [HttpPost("payment")]
        public async Task<IActionResult> ProcessPayment(Guid salonId, [FromBody] CreatePaymentRequest request)
        {
            var result = await _service.ProcessPaymentAsync(salonId, request, GetUserId());
            return Ok(result);
        }

        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments(Guid salonId)
        {
            var result = await _service.GetPaymentsAsync(salonId, GetUserId());
            return Ok(result);
        }

        [HttpGet("/api/subscription/config")]
        [AllowAnonymous]
        public IActionResult GetConfig()
        {
            var config = _service.GetConfig();
            return Ok(config);
        }
    }

    // Requests
    public record AddMasterSlotsRequest(int Count, int Months);
    public record AddModuleRequest(ModuleType Module, int Months);
}
