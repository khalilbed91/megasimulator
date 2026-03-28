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
            const string sql = "SELECT id, userid as UserId, name, type, payload, is_active as IsActive, metadata, created_at as CreatedAt, updated_at as UpdatedAt FROM simulations WHERE userid = @UserId ORDER BY created_at DESC";
            return await conn.QueryAsync<Simulation>(sql, new { UserId = userId });
        }

        public async Task UpdateAsync(Simulation simulation)
        {
            using var conn = _factory.CreateConnection();
            const string sql = @"UPDATE simulations SET name = @Name, type = @Type, payload = @Payload::jsonb, is_active = @IsActive, metadata = @Metadata::jsonb, updated_at = @UpdatedAt WHERE id = @Id";
            await conn.ExecuteAsync(sql, simulation);
        }
    }
}
