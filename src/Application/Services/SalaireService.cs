using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;
using StackExchange.Redis;
using Microsoft.Extensions.Caching.Memory;
using System.Text.Json;

namespace MegaSimulator.Application.Services
{
    public class SalaireService : ISalaireService
    {
        private readonly ISalaireRepository _repository;
        private readonly IConnectionMultiplexer? _redis;
        private readonly IMemoryCache? _memoryCache;

        public SalaireService(ISalaireRepository repository, IServiceProvider serviceProvider, IMemoryCache? memoryCache = null)
        {
            _repository = repository;
            _memoryCache = memoryCache;
            _redis = serviceProvider.GetService(typeof(IConnectionMultiplexer)) as IConnectionMultiplexer;
        }

        public async Task<SalaireDto?> GetByIdAsync(Guid id)
        {
            var key = $"salaire:{id}";
            if (_redis != null)
            {
                var db = _redis.GetDatabase();
                var cached = await db.StringGetAsync(key);
                if (cached.HasValue)
                {
                    return JsonSerializer.Deserialize<SalaireDto>(cached.ToString()!);
                }
                var entity = await _repository.GetByIdAsync(id);
                if (entity == null) return null;
                var dto = new SalaireDto(entity.Id, entity.EmployeeId, entity.BaseSalary, entity.Bonuses, entity.EffectiveDate);
                await db.StringSetAsync(key, JsonSerializer.Serialize(dto));
                return dto;
            }

            if (_memoryCache != null && _memoryCache.TryGetValue<SalaireDto>(key, out var cachedDto))
            {
                return cachedDto;
            }

            var e2 = await _repository.GetByIdAsync(id);
            if (e2 == null) return null;
            var result = new SalaireDto(e2.Id, e2.EmployeeId, e2.BaseSalary, e2.Bonuses, e2.EffectiveDate);
            if (_memoryCache != null)
            {
                _memoryCache.Set(key, result, TimeSpan.FromMinutes(5));
            }
            return result;
        }

        public async Task<IEnumerable<SalaireDto>> ListByEmployeeAsync(Guid employeeId)
        {
            var key = $"salaire:employee:{employeeId}";
            if (_redis != null)
            {
                var db = _redis.GetDatabase();
                var cached = await db.StringGetAsync(key);
                if (cached.HasValue)
                {
                    return JsonSerializer.Deserialize<IEnumerable<SalaireDto>>(cached.ToString()!)!;
                }
                var list = await _repository.ListByEmployeeAsync(employeeId);
                var dtos = list.Select(e => new SalaireDto(e.Id, e.EmployeeId, e.BaseSalary, e.Bonuses, e.EffectiveDate));
                await db.StringSetAsync(key, JsonSerializer.Serialize(dtos));
                return dtos;
            }

            if (_memoryCache != null && _memoryCache.TryGetValue<IEnumerable<SalaireDto>>(key, out var cachedList))
            {
                return cachedList;
            }

            var list2 = await _repository.ListByEmployeeAsync(employeeId);
            var result = list2.Select(e => new SalaireDto(e.Id, e.EmployeeId, e.BaseSalary, e.Bonuses, e.EffectiveDate));
            if (_memoryCache != null)
            {
                _memoryCache.Set(key, result, TimeSpan.FromMinutes(5));
            }
            return result;
        }

        public async Task<SalaireDto> CreateAsync(SalaireDto dto)
        {
            var entity = new Salaire
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                EmployeeId = dto.EmployeeId,
                BaseSalary = dto.BaseSalary,
                Bonuses = dto.Bonuses,
                EffectiveDate = dto.EffectiveDate
            };

            await _repository.AddAsync(entity);

            // invalidate cache for employee list and single item
            if (_redis != null)
            {
                var db = _redis.GetDatabase();
                await db.KeyDeleteAsync($"salaire:employee:{entity.EmployeeId}");
                await db.KeyDeleteAsync($"salaire:{entity.Id}");
            }
            else if (_memoryCache != null)
            {
                _memoryCache.Remove($"salaire:employee:{entity.EmployeeId}");
                _memoryCache.Remove($"salaire:{entity.Id}");
            }

            return new SalaireDto(entity.Id, entity.EmployeeId, entity.BaseSalary, entity.Bonuses, entity.EffectiveDate);
        }
    }
}
