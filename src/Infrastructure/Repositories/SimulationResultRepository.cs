using System;
using System.Collections.Generic;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;
using MegaSimulator.Infrastructure.Persistence;

namespace MegaSimulator.Infrastructure.Repositories
{
    public class SimulationResultRepository : ISimulationResultRepository
    {
        private readonly IDbConnectionFactory _factory;

        public SimulationResultRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task AddAsync(SimulationResult result)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "INSERT INTO simulation_results (id, simulation_id, result, created_at) VALUES (@Id, @SimulationId, @Result::jsonb, @CreatedAt)";
            await conn.ExecuteAsync(sql, result);
        }

        public async Task<IEnumerable<SimulationResult>> ListBySimulationAsync(Guid simulationId)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "SELECT id, simulation_id as SimulationId, result, created_at as CreatedAt FROM simulation_results WHERE simulation_id = @SimulationId ORDER BY created_at DESC";
            return await conn.QueryAsync<SimulationResult>(sql, new { SimulationId = simulationId });
        }

        public async Task<SimulationResult?> GetByIdAsync(Guid id)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "SELECT id, simulation_id as SimulationId, result, created_at as CreatedAt FROM simulation_results WHERE id = @Id";
            return await conn.QueryFirstOrDefaultAsync<SimulationResult>(sql, new { Id = id });
        }
    }
}
