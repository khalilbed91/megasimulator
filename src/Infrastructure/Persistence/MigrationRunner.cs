using System;
using System.IO;
using System.Threading.Tasks;
using Dapper;
using System.Data.Common;
using Microsoft.Extensions.Logging;

namespace MegaSimulator.Infrastructure.Persistence
{
    public interface IMigrationRunner
    {
        Task MigrateAsync();
    }

    public class MigrationRunner : IMigrationRunner
    {
        private readonly IDbConnectionFactory _factory;
        private readonly ILogger<MigrationRunner> _logger;
        private readonly string _migrationsPath;

        public MigrationRunner(IDbConnectionFactory factory, ILogger<MigrationRunner> logger)
        {
            _factory = factory;
            _logger = logger;
            // robustly walk upward from a couple of starting points to find the migrations folder
            string? TryFind(string start)
            {
                var d = new DirectoryInfo(start);
                while (d != null)
                {
                    var candidate1 = Path.Combine(d.FullName, "Infrastructure", "Migrations");
                    var candidate2 = Path.Combine(d.FullName, "src", "Infrastructure", "Migrations");
                    if (Directory.Exists(candidate1)) return candidate1;
                    if (Directory.Exists(candidate2)) return candidate2;
                    d = d.Parent;
                }
                return null;
            }

            var foundPath = TryFind(AppContext.BaseDirectory) ?? TryFind(Directory.GetCurrentDirectory());
            if (!string.IsNullOrEmpty(foundPath)) _migrationsPath = foundPath;
            else _migrationsPath = Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", "src", "Infrastructure", "Migrations");
        }

        public async Task MigrateAsync()
        {
            if (!Directory.Exists(_migrationsPath))
            {
                _logger.LogWarning("Migrations folder not found: {path}", _migrationsPath);
                return;
            }

            var files = Directory.GetFiles(_migrationsPath, "*.sql");
            Array.Sort(files);

            using var conn = _factory.CreateConnection();
            if (conn is DbConnection dbConn)
            {
                await dbConn.OpenAsync();
            }
            else
            {
                conn.Open();
            }

            foreach (var f in files)
            {
                var sql = await File.ReadAllTextAsync(f);
                _logger.LogInformation("Applying migration {file}", f);
                await conn.ExecuteAsync(sql);
            }
        }
    }
}
