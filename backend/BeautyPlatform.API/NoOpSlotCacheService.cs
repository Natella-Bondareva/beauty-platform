using CRMService.Application.Features.Scheduling.DTOs;
using CRMService.Application.Features.Scheduling.Interfaces;

namespace CRMService.API
{
    public class NoOpSlotCacheService : ISlotCacheService
    {
        public Task<List<AvailableSlotDto>?> GetAsync(string key)
            => Task.FromResult<List<AvailableSlotDto>?>(null);
        public Task SetAsync(string key, List<AvailableSlotDto> slots, TimeSpan ttl)
            => Task.CompletedTask;
        public Task RemoveAsync(string key)
            => Task.CompletedTask;
        public Task RemoveByPatternAsync(string pattern)
            => Task.CompletedTask;
    }
}
