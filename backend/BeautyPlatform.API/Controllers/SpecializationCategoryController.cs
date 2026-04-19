using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employess.Commands.Employee_Commands;
using CRMService.Application.Features.Employess.Commands.Service_Commands;
using CRMService.Application.Features.Employess.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/salons/{salonId}/categories")]
    public class SpecializationCategoryController : ApiControllerBase
    {
        private readonly ISpecializationCategoryService _categoryService;

        public SpecializationCategoryController(ISpecializationCategoryService categoryService)
        {
            _categoryService = categoryService;
        }

        // GET api/salons/{salonId}/categories
        // Повертає глобальні + кастомні категорії цього салону
        [HttpGet]
        public async Task<IActionResult> GetAll(Guid salonId)
        {
            var categories = await _categoryService.GetAvailableAsync(salonId);
            return Ok(categories);
        }

        // POST api/salons/{salonId}/categories
        // Створити кастомну категорію для салону
        [HttpPost]
        public async Task<IActionResult> Create(Guid salonId, CreateCategoryCommand command)
        {
            var ownerId = GetUserId();
            var id = await _categoryService.CreateCustomAsync(command, salonId, ownerId);
            return CreatedAtAction(nameof(GetAll), new { salonId }, new { id });
        }

        // PUT api/salons/{salonId}/categories/{id}
        // Редагувати тільки кастомні категорії (глобальні — заборонено)
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid salonId, Guid id, UpdateCategoryCommand command)
        {
            var ownerId = GetUserId();
            await _categoryService.UpdateCustomAsync(id, command, salonId, ownerId);
            return NoContent();
        }
    }
}