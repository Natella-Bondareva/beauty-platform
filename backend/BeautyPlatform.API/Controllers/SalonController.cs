using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.DTOs;
using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers    
{
    [Authorize]
    [ApiController]
    [Route("api/salons")]
    public class SalonController : ApiControllerBase
    {
        private ISalonService _service;

        public SalonController(ISalonService service)
        {
            _service = service;
        }

        // Тимчасово в SalonController — щоб побачити всі claims з токена
        [HttpGet("debug-claims")]
        public IActionResult DebugClaims()
        {
            var claims = User.Claims.Select(c => new { c.Type, c.Value });
            return Ok(claims);
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateSalonCommand command)
        {
            var ownerId = GetUserId();
            var id = await _service.CreateAsync(command, ownerId);
            // Повертаємо 201 Created з посиланням на новий ресурс
            return CreatedAtAction(nameof(Get), new { id }, new { id });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var ownerId = GetUserId();
            var salon = await _service.GetByIdAsync(id, ownerId);
            return Ok(salon);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, UpdateSalonCommand command)
        {
            var ownerId = GetUserId();
            await _service.UpdateAsync(id, command, ownerId);
            return NoContent();
        }
    }
}
