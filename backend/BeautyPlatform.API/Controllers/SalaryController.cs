using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.Pricing.DTOs;
using CRMService.Application.Features.SalaryModule.Interfaces;
using CRMService.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/salary")]
    public class SalaryController : ApiControllerBase
    {
        private readonly ISalaryService _service;

        public SalaryController(ISalaryService service)
        {
            _service = service;
        }

        [HttpPost("contracts")]
        public async Task<IActionResult> CreateContract(
            Guid salonId,
            CreateContractCommand command)
        {
            var id = await _service.CreateContractAsync(salonId, command, GetUserId());
            return Created("", new { id });
        }

        [HttpPut("contracts/{contractId}")]
        public async Task<IActionResult> UpdateContract(
            Guid contractId,
            UpdateContractCommand command)
        {
            await _service.UpdateContractAsync(contractId, command, GetUserId());
            return NoContent();
        }

        // Генерує виплату за вказаний період
        [HttpPost("payments/generate")]
        public async Task<IActionResult> GeneratePayment(
            Guid salonId,
            GeneratePaymentRequest request)
        {
            var result = await _service.GeneratePaymentAsync(
                salonId,
                request.MasterId,
                request.PeriodStart,
                request.PeriodEnd,
                GetUserId());
            return Ok(result);
        }

        // Список виплат з фільтрацією
        [HttpGet("payments")]
        public async Task<IActionResult> GetPayments(
            Guid salonId,
            [FromQuery] Guid? masterId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var result = await _service.GetPaymentsAsync(
                salonId, masterId, from, to, GetUserId());
            return Ok(result);
        }

        // Власник натискає "Виплатив"
        [HttpPost("payments/{paymentId}/pay")]
        public async Task<IActionResult> MarkAsPaid(
            Guid paymentId,
            MarkAsPaidCommand command)
        {
            await _service.MarkAsPaidAsync(paymentId, command, GetUserId());
            return NoContent();
        }

        // Прогноз по всіх майстрах
        [HttpGet("forecast")]
        public async Task<IActionResult> GetForecast(Guid salonId)
        {
            var result = await _service.GetForecastAsync(salonId, GetUserId());
            return Ok(result);
        }

        [HttpGet("contracts/{masterId}")]
        public async Task<IActionResult> GetContract(Guid salonId, Guid masterId)
        {
            var result = await _service.GetContractAsync(masterId, salonId, GetUserId());
            return Ok(result);
        }
    }

    public record GeneratePaymentRequest(
        Guid MasterId,
        DateTime PeriodStart,
        DateTime PeriodEnd
    );
}
