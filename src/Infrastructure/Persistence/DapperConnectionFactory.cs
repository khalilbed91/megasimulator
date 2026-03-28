using System.Data;
using Npgsql;
using Microsoft.Extensions.Configuration;

namespace MegaSimulator.Infrastructure.Persistence
{
    public interface IDbConnectionFactory
    {
        IDbConnection CreateConnection();
    }

    public class DapperConnectionFactory : IDbConnectionFactory
    {
        private readonly string _connectionString;

        public DapperConnectionFactory(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("Default") ?? System.Environment.GetEnvironmentVariable("CONNECTION_STRINGS__DEFAULT") ?? string.Empty;
        }

        public IDbConnection CreateConnection()
        {
            return new NpgsqlConnection(_connectionString);
        }
    }
}
