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
        private readonly IBookingFieldAnswerService _answerService;

        public BookingController(
            IBookingService bookingService,
            IBookingFieldAnswerService answerService)
        {
            _bookingService = bookingService;
            _answerService = answerService;
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
        /// Клієнт надсилає відповіді на кастомні поля бронювання.
        /// Можна викликати для Pending або Confirmed статусів (повторний виклик перезаписує).
        /// POST /api/bookings/{bookingId}/answers
        /// </summary>
        [HttpPost("api/bookings/{bookingId}/answers")]
        [AllowAnonymous]
        public async Task<IActionResult> SubmitAnswers(
            Guid bookingId,
            [FromBody] SubmitBookingAnswersCommand command)
        {
            await _answerService.SubmitAnswersAsync(bookingId, command);
            return NoContent();
        }

        /// <summary>
        /// Адмін створює запис вручну — одразу Confirmed, без SMS.
        /// POST /api/salons/{salonId}/bookings/admin
        /// </summary>
        [HttpPost("api/salons/{salonId}/bookings/admin")]
        [Authorize]
        public async Task<IActionResult> CreateByAdmin(
            Guid salonId,
            [FromBody] CreateAdminBookingCommand command)
        {
            var ownerId = GetUserId();
            var result = await _bookingService.CreateByAdminAsync(command, salonId, ownerId);
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
            [FromQuery] DateOnly? dateFrom,
            [FromQuery] DateOnly? dateTo,
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
                DateFrom = dateFrom,
                DateTo = dateTo,
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
        /// Записи майстра (власний кабінет).
        /// GET /api/salons/{salonId}/bookings/my?date=...
        /// GET /api/salons/{salonId}/bookings/my?dateFrom=...&amp;dateTo=...
        /// </summary>
        [HttpGet("api/salons/{salonId}/bookings/my")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings(
            Guid salonId,
            [FromQuery] DateOnly? date,
            [FromQuery] DateOnly? dateFrom,
            [FromQuery] DateOnly? dateTo)
        {
            var userId = GetUserId();
            var result = await _bookingService.GetMyBookingsAsync(
                salonId, userId, date, dateFrom, dateTo);
            return Ok(result);
        }

        /// <summary>
        /// Завершення бронювання майстром.
        /// POST /api/bookings/{bookingId}/complete
        /// </summary>
        [HttpPost("api/bookings/{bookingId}/complete")]
        [Authorize]
        public async Task<IActionResult> Complete(Guid bookingId)
        {
            var userId = GetUserId();
            await _bookingService.CompleteByEmployeeAsync(bookingId, userId);
            return NoContent();
        }
    

        /// <summary>
        /// Клієнт запитує SMS-код для перегляду своєї історії.
        /// POST /api/salons/{salonId}/bookings/request-client-code
        /// </summary>
        [HttpPost("api/salons/{salonId}/bookings/request-client-code")]
        [AllowAnonymous]
        public async Task<IActionResult> RequestClientCode(
            Guid salonId, [FromBody] ClientCodeRequest request)
        {
            await _bookingService.RequestClientCodeAsync(request.Phone);
            return Ok(new { message = "Код надіслано на ваш номер." });
        }

        /// <summary>
        /// Клієнт верифікує номер і отримує свою історію записів.
        /// POST /api/salons/{salonId}/bookings/client-history
        /// </summary>
        [HttpPost("api/salons/{salonId}/bookings/client-history")]
        [AllowAnonymous]
        public async Task<IActionResult> GetClientHistory(
            Guid salonId, [FromBody] ClientHistoryRequest request)
        {
            var history = await _bookingService.GetClientHistoryAsync(
                salonId, request.Phone, request.Code);
            return Ok(history);
        }

        /// <summary>
        /// Клієнт скасовує власний запис через SMS-верифікацію.
        /// POST /api/bookings/{bookingId}/client-cancel
        /// </summary>
        [HttpPost("api/bookings/{bookingId}/client-cancel")]
        [AllowAnonymous]
        public async Task<IActionResult> ClientCancel(
            Guid bookingId, [FromBody] ClientCancelRequest request)
        {
            await _bookingService.CancelByClientAsync(bookingId, request.Phone, request.Code);
            return NoContent();
        }
    }

    // ── Request моделі ─────────────────────────────────────────────
    public record VerifyCodeRequest(string Code);
    public record CancelBookingRequest(string Reason);
    public record ClientCodeRequest(string Phone);
    public record ClientHistoryRequest(string Phone, string Code);
    public record ClientCancelRequest(string Phone, string Code);
}
