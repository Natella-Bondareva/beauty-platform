using CRMService.Application.Features.Scheduling.DTOs;
using CRMService.Application.Features.Scheduling.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;
using StackExchange.Redis;
using System.Text.Json;
using IDatabase = StackExchange.Redis.IDatabase;

namespace CRMService.Infrastructure.Caching
{
    public class RedisSlotCacheService : ISlotCacheService
    {
        private readonly IDatabase _db;

        public RedisSlotCacheService(IConnectionMultiplexer redis)
        {
            _db = redis.GetDatabase();
        }

        public async Task<List<AvailableSlotDto>?> GetAsync(string cacheKey)
        {
            var value = await _db.StringGetAsync(cacheKey);
            if (!value.HasValue) return null;

            return JsonSerializer.Deserialize<List<AvailableSlotDto>>(value!);
        }

        public async Task SetAsync(string cacheKey, List<AvailableSlotDto> slots, TimeSpan ttl)
        {
            var json = JsonSerializer.Serialize(slots);
            await _db.StringSetAsync(cacheKey, json, ttl);
        }

        public async Task RemoveAsync(string cacheKey)
        {
            await _db.KeyDeleteAsync(cacheKey);
        }

        public async Task RemoveByPatternAsync(string pattern)
        {
            // Використовується для інвалідації всіх слотів салону/послуги
            var server = _db.Multiplexer.GetServer(
                _db.Multiplexer.GetEndPoints().First());

            var keys = server.Keys(pattern: pattern).ToArray();
            if (keys.Any())
                await _db.KeyDeleteAsync(keys);
        }
    }
}