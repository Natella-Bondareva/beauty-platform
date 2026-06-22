using CRMService.Application.Features.BookingServices.Commands;
using CRMService.Application.Features.BookingServices.Filters;
using CRMService.Application.Features.BookingServices.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/booking-fields")]
    public class BookingFieldController : ApiControllerBase
    {
        private readonly IBookingFieldService _service;

        public BookingFieldController(IBookingFieldService service)
        {
            _service = service;
        }

        // Власник — бачить всі поля салону
        [HttpGet]
        public async Task<IActionResult> GetAll(Guid salonId)
        {
            var result = await _service.GetBySalonAsync(salonId, GetUserId());
            return Ok(result);
        }

        // Клієнт при записі — отримує тільки релевантні поля
        [HttpGet("for-booking")]
        [AllowAnonymous]
        public async Task<IActionResult> GetForBooking(
            Guid salonId,
            [FromQuery] Guid? serviceId,
            [FromQuery] Guid? masterId)
        {
            var result = await _service.GetForBookingAsync(salonId, serviceId, masterId);
            return Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(
            Guid salonId,
            CreateBookingFieldCommand command)
        {
            var id = await _service.CreateAsync(salonId, command, GetUserId());
            return Created("", new { id });
        }

        [HttpPut("{fieldId}")]
        public async Task<IActionResult> Update(
            Guid fieldId,
            UpdateBookingFieldCommand command)
        {
            await _service.UpdateAsync(fieldId, command, GetUserId());
            return NoContent();
        }

        [HttpDelete("{fieldId}")]
        public async Task<IActionResult> Delete(Guid fieldId)
        {
            await _service.DeleteAsync(fieldId, GetUserId());
            return NoContent();
        }
    }
}