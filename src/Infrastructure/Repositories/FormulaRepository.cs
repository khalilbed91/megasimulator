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
    public class FormulaRepository : IFormulaRepository
    {
        private readonly IDbConnectionFactory _factory;

        public FormulaRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task AddAsync(Formula formula)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "INSERT INTO formulas (id, name, expression, description, created_at) VALUES (@Id, @Name, @Expression, @Description, @CreatedAt)";
            await conn.ExecuteAsync(sql, formula);
        }

        public async Task<Formula?> GetByNameAsync(string name)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "SELECT id, name, expression, description, created_at as CreatedAt FROM formulas WHERE name = @Name";
            return await conn.QueryFirstOrDefaultAsync<Formula>(sql, new { Name = name });
        }

        public async Task<IEnumerable<Formula>> ListAllAsync()
        {
            using var conn = _factory.CreateConnection();
            const string sql = "SELECT id, name, expression, description, created_at as CreatedAt FROM formulas ORDER BY name";
            return await conn.QueryAsync<Formula>(sql);
        }
    }
}
