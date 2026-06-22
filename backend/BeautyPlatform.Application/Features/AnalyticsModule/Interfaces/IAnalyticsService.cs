using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public interface IAnalyticsService
    {
        Task<SalonAnalyticsDto> GetAsync(
            Guid salonId,
            DateTime from,
            DateTime to,
            Guid ownerId);
    }
}
