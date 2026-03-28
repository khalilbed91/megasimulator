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
    public class SalaireRepository : ISalaireRepository
    {
        private readonly IDbConnectionFactory _connectionFactory;

        public SalaireRepository(IDbConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task AddAsync(Salaire salaire)
        {
            using var conn = _connectionFactory.CreateConnection();
            const string sql = @"INSERT INTO salaires (id, employeeid, basesalary, bonuses, effectivedate)
VALUES (@Id, @EmployeeId, @BaseSalary, @Bonuses, @EffectiveDate)";
            await conn.ExecuteAsync(sql, salaire);
        }

        public async Task DeleteAsync(Guid id)
        {
            using var conn = _connectionFactory.CreateConnection();
            const string sql = "DELETE FROM salaires WHERE id = @Id";
            await conn.ExecuteAsync(sql, new { Id = id });
        }

        public async Task<Salaire?> GetByIdAsync(Guid id)
        {
            using var conn = _connectionFactory.CreateConnection();
            const string sql = "SELECT id, employeeid as EmployeeId, basesalary as BaseSalary, bonuses as Bonuses, effectivedate as EffectiveDate FROM salaires WHERE id = @Id";
            return await conn.QueryFirstOrDefaultAsync<Salaire>(sql, new { Id = id });
        }

        public async Task<IEnumerable<Salaire>> ListByEmployeeAsync(Guid employeeId)
        {
            using var conn = _connectionFactory.CreateConnection();
            const string sql = "SELECT id, employeeid as EmployeeId, basesalary as BaseSalary, bonuses as Bonuses, effectivedate as EffectiveDate FROM salaires WHERE employeeid = @EmployeeId";
            return await conn.QueryAsync<Salaire>(sql, new { EmployeeId = employeeId });
        }

        public async Task UpdateAsync(Salaire salaire)
        {
            using var conn = _connectionFactory.CreateConnection();
            const string sql = @"UPDATE salaires SET employeeid = @EmployeeId, basesalary = @BaseSalary, bonuses = @Bonuses, effectivedate = @EffectiveDate WHERE id = @Id";
            await conn.ExecuteAsync(sql, salaire);
        }
    }
}
