using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;

namespace MegaSimulator.Application.Services
{
    public class SimulationService : ISimulationService
    {
        private readonly ISimulationRepository _repo;
        private readonly PayrollService _payrollService;

        public SimulationService(ISimulationRepository repo, PayrollService payrollService)
        {
            _repo = repo;
            _payrollService = payrollService;
        }

        public async Task<SimulationDto?> GetByIdAsync(Guid id)
        {
            var s = await _repo.GetByIdAsync(id);
            if (s == null) return null;
            return Map(s);
        }

        public async Task<IEnumerable<SimulationDto>> ListByUserAsync(Guid userId)
        {
            var list = await _repo.ListByUserAsync(userId);
            return list.Select(Map);
        }

        public async Task<SimulationDto> CreateAsync(SimulationDto dto)
        {
            var entity = new Simulation
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                UserId = dto.UserId,
                Name = dto.Name,
                Type = dto.Type,
                Payload = dto.Payload,
                IsActive = dto.IsActive,
                Metadata = dto.Metadata,
                CreatedAt = dto.CreatedAt == default ? DateTime.UtcNow : dto.CreatedAt,
                UpdatedAt = dto.UpdatedAt
            };

            // If this is a payroll simulation, run payroll computations and embed results in payload
            if (string.Equals(entity.Type, "payroll", StringComparison.OrdinalIgnoreCase))
            {
                entity.Payload = await RunPayrollAndAttachResultsAsync(entity.Payload);
            }

            await _repo.AddAsync(entity);

            return Map(entity);
        }

        public async Task UpdateAsync(SimulationDto dto)
        {
            var entity = new Simulation
            {
                Id = dto.Id,
                UserId = dto.UserId,
                Name = dto.Name,
                Type = dto.Type,
                Payload = dto.Payload,
                IsActive = dto.IsActive,
                Metadata = dto.Metadata,
                CreatedAt = dto.CreatedAt,
                UpdatedAt = DateTime.UtcNow
            };

            if (string.Equals(entity.Type, "payroll", StringComparison.OrdinalIgnoreCase))
            {
                entity.Payload = await RunPayrollAndAttachResultsAsync(entity.Payload);
            }

            await _repo.UpdateAsync(entity);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repo.DeleteAsync(id);
        }

        private static SimulationDto Map(Simulation s)
        {
            return new SimulationDto(s.Id, s.UserId, s.Name, s.Type, s.Payload, s.IsActive, s.Metadata, s.CreatedAt, s.UpdatedAt);
        }

        private async Task<string> RunPayrollAndAttachResultsAsync(string payloadJson)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(payloadJson)) return payloadJson;

                var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
                using var doc = JsonDocument.Parse(payloadJson);
                var root = doc.RootElement.Clone();

                // Extract brut, statut, totalBruts if present
                decimal brut = 0;
                decimal totalBruts = 0;
                string statut = "non-cadre";

                if (root.TryGetProperty("Brut", out var prop) || root.TryGetProperty("brut", out prop))
                {
                    if (prop.ValueKind == JsonValueKind.Number && prop.TryGetDecimal(out var dv)) brut = dv;
                }

                if (root.TryGetProperty("TotalBruts", out var propT) || root.TryGetProperty("totalBruts", out propT))
                {
                    if (propT.ValueKind == JsonValueKind.Number && propT.TryGetDecimal(out var dv2)) totalBruts = dv2;
                }

                if (root.TryGetProperty("Statut", out var propS) || root.TryGetProperty("statut", out propS))
                {
                    if (propS.ValueKind == JsonValueKind.String) statut = propS.GetString() ?? statut;
                }

                // Compute values using PayrollService
                var net = brut > 0 ? await _payrollService.BrutToNet(brut, statut) : 0m;
                var employerCost = brut > 0 ? await _payrollService.EmployerCost(brut) : 0m;
                var cddPrime = totalBruts > 0 ? await _payrollService.ComputeCDDPrime(totalBruts) : 0m;

                // Build results object
                var results = new Dictionary<string, object>
                {
                    ["net"] = net,
                    ["employerCost"] = employerCost,
                    ["cddPrime"] = cddPrime,
                    ["computedAt"] = DateTime.UtcNow
                };

                // Merge original payload into a mutable dictionary
                var dict = JsonSerializer.Deserialize<Dictionary<string, object?>>(payloadJson, opts) ?? new Dictionary<string, object?>();
                dict["results"] = results;

                var mergedJson = JsonSerializer.Serialize(dict, opts);

                return mergedJson;
            }
            catch
            {
                // If anything fails, return original payload unchanged
                return payloadJson;
            }
        }
    }
}
