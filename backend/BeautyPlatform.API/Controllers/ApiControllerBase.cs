using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace CRMService.API.Controllers
{
    [ApiController]
    public abstract class ApiControllerBase : ControllerBase
    {
        protected Guid GetUserId()
        {
            var sub = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? throw new UnauthorizedAccessException("User identity not found.");
            return Guid.Parse(sub);
        }

        // Зручно мати для SalonController після онбордингу
        protected Guid? GetSalonId()
        {
            var claim = User.FindFirst("salon_id")?.Value;
            return claim is null ? null : Guid.Parse(claim);
        }
    }
}
