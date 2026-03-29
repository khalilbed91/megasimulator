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
            const string sql = "INSERT INTO users (id, username, email, first_name, last_name, phone, created_at, password_hash, roles) VALUES (@Id, @Username, @Email, @FirstName, @LastName, @Phone, @CreatedAt, @PasswordHash, @Roles)";
            await conn.ExecuteAsync(sql, user);
        }

        public async Task UpdateAsync(User user)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "UPDATE users SET username = @Username, email = @Email, first_name = @FirstName, last_name = @LastName, phone = @Phone, password_hash = @PasswordHash, roles = @Roles WHERE id = @Id";
            await conn.ExecuteAsync(sql, user);
        }

        public async Task<User?> GetByIdAsync(Guid id)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "SELECT id, username, email, first_name as FirstName, last_name as LastName, phone as Phone, created_at as CreatedAt, password_hash as PasswordHash, roles FROM users WHERE id = @Id";
            return await conn.QueryFirstOrDefaultAsync<User>(sql, new { Id = id });
        }

        public async Task<User?> GetByUsernameAsync(string username)
        {
            var login = username?.Trim() ?? string.Empty;
            if (login.Length == 0) return null;

            using var conn = _factory.CreateConnection();
            // Email or username; if several rows share the same email (e.g. Google account without password),
            // prefer the row that can log in with a password.
            const string sql = @"SELECT id, username, email, first_name as FirstName, last_name as LastName, phone as Phone, created_at as CreatedAt, password_hash as PasswordHash, roles
FROM users
WHERE username = @Login OR LOWER(TRIM(COALESCE(email, ''))) = LOWER(@Login)
ORDER BY
  CASE WHEN NULLIF(BTRIM(COALESCE(password_hash, '')), '') IS NOT NULL THEN 0 ELSE 1 END,
  CASE WHEN username = @Login THEN 0 ELSE 1 END
LIMIT 1";
            return await conn.QueryFirstOrDefaultAsync<User>(sql, new { Login = login });
        }

        public async Task DeleteAsync(Guid id)
        {
            using var conn = _factory.CreateConnection();
            const string sql = "DELETE FROM users WHERE id = @Id";
            await conn.ExecuteAsync(sql, new { Id = id });
        }
    }
}
