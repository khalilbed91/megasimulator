using System;
using System.Data;
using System.Threading.Tasks;
using Dapper;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;
using MegaSimulator.Infrastructure.Persistence;

namespace MegaSimulator.Infrastructure.Repositories
{
    public class UserRepository : IUserRepository
    {
        private readonly IDbConnectionFactory _factory;

        public UserRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task AddAsync(User user)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "INSERT INTO users (id, username, email, created_at, password_hash, roles) VALUES (@Id, @Username, @Email, @CreatedAt, @PasswordHash, @Roles)";
            await conn.ExecuteAsync(sql, user);
        }

        public async Task UpdateAsync(User user)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "UPDATE users SET username = @Username, email = @Email, password_hash = @PasswordHash, roles = @Roles WHERE id = @Id";
            await conn.ExecuteAsync(sql, user);
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "SELECT id, username, email, created_at as CreatedAt, password_hash as PasswordHash, roles FROM users WHERE id = @Id";
            return await conn.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "SELECT id, username, email, created_at as CreatedAt, password_hash as PasswordHash, roles FROM users WHERE username = @Username";
            return await conn.QueryFirstOrDefaultAsync<User>(sql, new { Username = username });
        }

        public async Task DeleteAsync(Guid id)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "DELETE FROM users WHERE id = @Id";
            await conn.ExecuteAsync(sql, new { Id = id });
        }
    }
}
