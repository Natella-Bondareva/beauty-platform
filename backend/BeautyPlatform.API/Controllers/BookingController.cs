using CRMService.Application.Features.BookingServices.Commands;
using CRMService.Application.Features.BookingServices.Filters;
using CRMService.Application.Features.BookingServices.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [ApiController]
    public class BookingController : ApiControllerBase
    {
        private readonly IBookingService _bookingService;

        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }

        /// <summary>
        /// Клієнт створює бронювання.
        /// Анонімний endpoint — клієнт не авторизований.
        /// POST /api/salons/{salonId}/bookings
        /// </summary>
        [HttpPost("api/salons/{salonId}/bookings")]
        [AllowAnonymous]
        public async Task<IActionResult> Create(Guid salonId, CreateBookingCommand command)
        {
            // Підставляємо salonId з route
            var cmd = command with { SalonId = salonId };
            var result = await _bookingService.CreateAsync(cmd);
            return Ok(result);
        }

        /// <summary>
        /// Верифікація SMS коду.
        /// POST /api/bookings/{bookingId}/verify-code
        /// </summary>
        [HttpPost("api/bookings/{bookingId}/verify-code")]
        [AllowAnonymous]
        public async Task<IActionResult> VerifyCode(Guid bookingId, [FromBody] VerifyCodeRequest request)
        {
            var result = await _bookingService.VerifyCodeAsync(bookingId, request.Code);

            if (!result.Success && result.AttemptsLeft == 0)
                return BadRequest(result);

            return Ok(result);
        }

        /// <summary>
        /// Список бронювань салону (для адміна).
        /// GET /api/salons/{salonId}/bookings
        /// </summary>
        [HttpGet("api/salons/{salonId}/bookings")]
        [Authorize]
        public async Task<IActionResult> GetBySalon(
            Guid salonId,
            [FromQuery] DateOnly? date,
            [FromQuery] Guid? employeeId,
            [FromQuery] string? status)
        {
            var ownerId = GetUserId();

            Domain.Enums.BookingStatus? parsedStatus = null;
            if (!string.IsNullOrEmpty(status) &&
                Enum.TryParse<Domain.Enums.BookingStatus>(status, true, out var s))
                parsedStatus = s;

            var filter = new BookingFilterDto
            {
                Date = date,
                EmployeeId = employeeId,
                Status = parsedStatus
            };

            var bookings = await _bookingService.GetBySalonAsync(salonId, ownerId, filter);
            return Ok(bookings);
        }

        /// <summary>
        /// Деталі бронювання.
        /// GET /api/bookings/{bookingId}
        /// </summary>
        [HttpGet("api/bookings/{bookingId}")]
        [Authorize]
        public async Task<IActionResult> GetById(Guid bookingId)
        {
            var booking = await _bookingService.GetByIdAsync(bookingId);
            return Ok(booking);
        }

        /// <summary>
        /// Скасування бронювання.
        /// POST /api/bookings/{bookingId}/cancel
        /// </summary>
        [HttpPost("api/bookings/{bookingId}/cancel")]
        [Authorize]
        public async Task<IActionResult> Cancel(Guid bookingId, [FromBody] CancelBookingRequest request)
        {
            var requesterId = GetUserId();
            await _bookingService.CancelAsync(bookingId, request.Reason, requesterId);
            return NoContent();
        }

        /// <summary>
        /// Завершення бронювання майстром.
        /// POST /api/bookings/{bookingId}/complete
        /// </summary>
        [HttpPost("api/bookings/{bookingId}/complete")]
        [Authorize]
        public async Task<IActionResult> Complete(Guid bookingId)
        {
            var employeeId = GetUserId();
            await _bookingService.CompleteAsync(bookingId, employeeId);
            return NoContent();
        }
    }

    // ── Request моделі ─────────────────────────────────────────────
    public record VerifyCodeRequest(string Code);
    public record CancelBookingRequest(string Reason);
}