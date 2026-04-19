using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employess.Commands.Service_Commands;
using CRMService.Application.Features.Employess.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/services")]
    public class ServiceController : ApiControllerBase
    {
        private readonly ISalonServiceService _serviceService;

        public ServiceController(ISalonServiceService serviceService)
        {
            _serviceService = serviceService;
        }

        // GET api/salons/{salonId}/services
        [HttpGet]
        public async Task<IActionResult> GetAll(Guid salonId)
        {
            var ownerId = GetUserId();
            var services = await _serviceService.GetBySalonAsync(salonId, ownerId);
            return Ok(services);
        }

        // GET api/salons/{salonId}/services/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            var service = await _serviceService.GetByIdAsync(id, salonId, ownerId);
            return Ok(service);
        }

        // POST api/salons/{salonId}/services
        [HttpPost]
        public async Task<IActionResult> Create(Guid salonId, CreateServiceCommand command)
        {
            var ownerId = GetUserId();
            var id = await _serviceService.CreateAsync(command, salonId, ownerId);
            return CreatedAtAction(nameof(GetById), new { salonId, id }, new { id });
        }

        // PUT api/salons/{salonId}/services/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid salonId, Guid id, UpdateServiceCommand command)
        {
            var ownerId = GetUserId();
            await _serviceService.UpdateAsync(id, command, salonId, ownerId);
            return NoContent();
        }

        // DELETE api/salons/{salonId}/services/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Deactivate(Guid salonId, Guid id)
        {
            var ownerId = GetUserId();
            await _serviceService.DeactivateAsync(id, salonId, ownerId);
            return NoContent();
        }

        // ── Images ─────────────────────────────────────────────────

        // POST api/salons/{salonId}/services/{id}/images
        [HttpPost("{id}/images")]
        public async Task<IActionResult> AddImage(Guid salonId, Guid id, IFormFile file, [FromQuery] bool isCover = false)
        {
            if (file is null || file.Length == 0)
                return BadRequest("File is required.");

            // Базова перевірка типу файлу
            var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
            if (!allowedTypes.Contains(file.ContentType.ToLower()))
                return BadRequest("Only JPEG, PNG and WebP images are allowed.");

            var ownerId = GetUserId();

            var command = new AddServiceImageCommand(
                file.OpenReadStream(),
                file.FileName,
                file.ContentType,
                isCover);

            var image = await _serviceService.AddImageAsync(id, command, salonId, ownerId);
            return Ok(image);
        }

        // DELETE api/salons/{salonId}/services/{id}/images/{imageId}
        [HttpDelete("{id}/images/{imageId}")]
        public async Task<IActionResult> RemoveImage(Guid salonId, Guid id, Guid imageId)
        {
            var ownerId = GetUserId();
            await _serviceService.RemoveImageAsync(id, imageId, salonId, ownerId);
            return NoContent();
        }
    }
}