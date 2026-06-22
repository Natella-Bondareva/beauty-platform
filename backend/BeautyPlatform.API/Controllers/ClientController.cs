using CRMService.Application.Features.BookingServices.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/clients")]
    public class ClientController : ApiControllerBase
    {
        private readonly IClientService _clientService;

        public ClientController(IClientService clientService)
        {
            _clientService = clientService;
        }

        /// <summary>
        /// Пошук клієнта по телефону (для модалки адмін-запису).
        /// GET /api/salons/{salonId}/clients?phone=+38050
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Search(
            Guid salonId,
            [FromQuery] string? phone)
        {
            var ownerId = GetUserId();
            var clients = await _clientService.SearchAsync(salonId, phone, ownerId);
            return Ok(clients);
        }
    }
}
