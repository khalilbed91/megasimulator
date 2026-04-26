using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Infrastructure.Persistence;
using Microsoft.Extensions.Caching.Memory;

namespace MegaSimulator.Infrastructure.Services
{
    public class PostalCodeService : IPostalCodeService
    {
        private const string CacheKey = "reference:france_postal_codes:v1";
        private readonly IDbConnectionFactory _factory;
        private readonly IMemoryCache _cache;

        public PostalCodeService(IDbConnectionFactory factory, IMemoryCache cache)
        {
            _factory = factory;
            _cache = cache;
        }

        public async Task<IReadOnlyList<PostalCodeDto>> SearchAsync(string query, int limit = 12)
        {
            var all = await GetAllAsync();
            var q = Normalize(query);
            if (string.IsNullOrWhiteSpace(q)) return Array.Empty<PostalCodeDto>();

            var max = Math.Clamp(limit, 1, 30);
            return all
                .Where(p => p.PostalCode.StartsWith(q, StringComparison.OrdinalIgnoreCase)
                    || Normalize(p.City).StartsWith(q)
                    || Normalize(p.City).Contains(q))
                .OrderByDescending(p => p.PostalCode.StartsWith(q, StringComparison.OrdinalIgnoreCase))
                .ThenBy(p => p.PostalCode)
                .ThenBy(p => p.City)
                .Take(max)
                .ToList();
        }

        public async Task<PostalCodeDto?> GetBestMatchAsync(string postalCode)
        {
            var all = await GetAllAsync();
            var code = OnlyDigits(postalCode);
            if (code.Length != 5) return null;

            return all
                .Where(p => p.PostalCode == code)
                .OrderBy(p => p.City)
                .FirstOrDefault();
        }

        private async Task<IReadOnlyList<PostalCodeDto>> GetAllAsync()
        {
            var cached = await _cache.GetOrCreateAsync(CacheKey, async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(12);
                using var conn = _factory.CreateConnection();
                const string sql = @"
SELECT
  postal_code AS PostalCode,
  city AS City,
  department_code AS DepartmentCode,
  department_name AS DepartmentName,
  region_name AS RegionName,
  zone_factor AS ZoneFactor
FROM france_postal_codes
ORDER BY postal_code, city;";
                var rows = await conn.QueryAsync<PostalCodeDto>(sql);
                return rows.ToList();
            });
            if (cached == null) return Array.Empty<PostalCodeDto>();
            return cached;
        }

        private static string OnlyDigits(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return "";
            return new string(value.Where(char.IsDigit).ToArray());
        }

        private static string Normalize(string? value)
        {
            if (string.IsNullOrWhiteSpace(value)) return "";
            return value.Trim().ToLowerInvariant();
        }
    }
}
