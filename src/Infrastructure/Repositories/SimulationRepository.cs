using System;
using System.Collections.Generic;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;
using MegaSimulator.Infrastructure.Persistence;

namespace MegaSimulator.Infrastructure.Repositories
{
    public class SimulationRepository : ISimulationRepository
    {
        /// <summary>Maximum saved simulations per user (FIFO: older rows removed when exceeded).</summary>
        public const int MaxSimulationsPerUser = 10;

        private readonly IDbConnectionFactory _factory;

        public SimulationRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task AddAsync(Simulation simulation)
        {
            using var conn = _factory.CreateConnection();
            const string sql = @"INSERT INTO simulations (id, userid, name, type, payload, is_active, metadata, created_at, updated_at)
VALUES (@Id, @UserId, @Name, @Type, @Payload::jsonb, @IsActive, @Metadata::jsonb, @CreatedAt, @UpdatedAt)";
            await conn.ExecuteAsync(sql, simulation);
            await TrimExcessSimulationsForUserAsync(conn, simulation.UserId);
        }

        public async Task DeleteAsync(Guid id)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "DELETE FROM simulations WHERE id = @Id";
            await conn.ExecuteAsync(sql, new { Id = id });
        }

        public async Task<Simulation?> GetByIdAsync(Guid id)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "SELECT id, userid as UserId, name, type, payload, is_active as IsActive, metadata, created_at as CreatedAt, updated_at as UpdatedAt FROM simulations WHERE id = @Id";
            return await conn.QueryFirstOrDefaultAsync<Simulation>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Simulation>> ListByUserAsync(Guid userId)
        {
            using var conn = _factory.CreateConnection();
            await TrimExcessSimulationsForUserAsync(conn, userId);
            const string sql = "SELECT id, userid as UserId, name, type, payload, is_active as IsActive, metadata, created_at as CreatedAt, updated_at as UpdatedAt FROM simulations WHERE userid = @UserId ORDER BY created_at DESC";
            return await conn.QueryAsync<Simulation>(sql, new { UserId = userId });
        }

        public async Task UpdateAsync(Simulation simulation)
        {
            using var conn = _factory.CreateConnection();
            const string sql = @"UPDATE simulations SET name = @Name, type = @Type, payload = @Payload::jsonb, is_active = @IsActive, metadata = @Metadata::jsonb, updated_at = @UpdatedAt WHERE id = @Id";
            await conn.ExecuteAsync(sql, simulation);
        }

        /// <summary>
        /// Keeps the <see cref="MaxSimulationsPerUser"/> most recent rows per user (by <c>created_at</c> DESC).
        /// </summary>
        private static async Task TrimExcessSimulationsForUserAsync(IDbConnection conn, Guid? userId)
        {
            if (userId == null || userId == Guid.Empty) return;

            const string deleteSimulations = @"
DELETE FROM simulations
WHERE id IN (
  SELECT id FROM (
    SELECT id FROM simulations WHERE userid = @UserId ORDER BY created_at DESC OFFSET @Keep
  ) excess
);";

            await conn.ExecuteAsync(deleteSimulations, new { UserId = userId, Keep = MaxSimulationsPerUser });
        }
    }
}
