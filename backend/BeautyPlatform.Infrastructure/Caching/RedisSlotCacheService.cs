using CRMService.Application.Features.Scheduling.DTOs;
using CRMService.Application.Features.Scheduling.Interfaces;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;
using IDatabase = StackExchange.Redis.IDatabase;

namespace CRMService.Infrastructure.Caching
{
    public class RedisSlotCacheService : ISlotCacheService
    {
        private readonly IDatabase _db;
        private readonly ILogger<RedisSlotCacheService> _logger;

        // PropertyNameCaseInsensitive захищає від невідповідності регістру між Write/Read.
        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNameCaseInsensitive = true,
        };

        public RedisSlotCacheService(IConnectionMultiplexer redis, ILogger<RedisSlotCacheService> logger)
        {
            _db     = redis.GetDatabase();
            _logger = logger;
        }

        public async Task<List<AvailableSlotDto>?> GetAsync(string cacheKey)
        {
            RedisValue value;
            try
            {
                value = await _db.StringGetAsync(cacheKey);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Redis read failed for {Key}", cacheKey);
                return null;
            }

            if (!value.HasValue || value.IsNullOrEmpty)
            {
                _logger.LogDebug("Cache MISS: {Key}", cacheKey);
                return null;
            }

            try
            {
                var result = JsonSerializer.Deserialize<List<AvailableSlotDto>>(value!, _jsonOptions);
                _logger.LogDebug("Cache HIT: {Key} ({Count} slots)", cacheKey, result?.Count ?? 0);
                return result;
            }
            catch (JsonException ex)
            {
                _logger.LogWarning(ex, "Cache deserialization failed for {Key} — evicting stale entry", cacheKey);
                await _db.KeyDeleteAsync(cacheKey);
                return null;
            }
        }

        public async Task SetAsync(string cacheKey, List<AvailableSlotDto> slots, TimeSpan ttl)
        {
            try
            {
                var json = JsonSerializer.Serialize(slots, _jsonOptions);
                await _db.StringSetAsync(cacheKey, json, ttl);
                _logger.LogDebug("Cache SET: {Key} ({Count} slots, TTL {Ttl})", cacheKey, slots.Count, ttl);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache write failed for {Key} — continuing without cache", cacheKey);
            }
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