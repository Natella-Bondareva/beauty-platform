using CRMService.Application.Features.Scheduling.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.Interfaces
{
    public interface ISlotCacheService
    {
        Task<List<AvailableSlotDto>?> GetAsync(string cacheKey);
        Task SetAsync(string cacheKey, List<AvailableSlotDto> slots, TimeSpan ttl);
        Task RemoveAsync(string cacheKey);
        Task RemoveByPatternAsync(string pattern);

        static string BuildKey(Guid salonId, Guid serviceId, DateOnly date)
            => $"available-slots:{salonId}:{serviceId}:{date:yyyy-MM-dd}";
    }
}
