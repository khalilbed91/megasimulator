using System;
using System.Threading.Tasks;
using Dapper;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;
using MegaSimulator.Infrastructure.Persistence;

namespace MegaSimulator.Infrastructure.Repositories
{
    public class ContactRequestRepository : IContactRepository
    {
        private readonly IDbConnectionFactory _factory;

        public ContactRequestRepository(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task AddAsync(ContactRequest req)
        {
            using var conn = _factory.CreateConnection();
            const string sql = @"
INSERT INTO contact_requests (id, userid, name, email, message, status, created_at, updated_at)
VALUES (@Id, @UserId, @Name, @Email, @Message, @Status, @CreatedAt, @UpdatedAt);";
            await conn.ExecuteAsync(sql, req);
        }
    }
}

