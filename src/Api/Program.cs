using System.Data;
using Dapper;
using Microsoft.Extensions.DependencyInjection;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Application.Services;
using MegaSimulator.Domain.Interfaces;
using MegaSimulator.Infrastructure.Persistence;
using MegaSimulator.Infrastructure.Repositories;
using MegaSimulator.Infrastructure.Services;
using MegaSimulator.Application.Params;
using Npgsql;
using StackExchange.Redis;

var builder = WebApplication.CreateBuilder(args);

// Configuration
var defaultConnectionString = builder.Configuration.GetConnectionString("Default") ?? Environment.GetEnvironmentVariable("CONNECTION_STRINGS__DEFAULT");
var redisConn = builder.Configuration["REDIS__CONNECTION"] ?? Environment.GetEnvironmentVariable("REDIS__CONNECTION");
var jwtKey = builder.Configuration["JWT:Key"] ?? Environment.GetEnvironmentVariable("JWT__KEY");
var jwtIssuer = builder.Configuration["JWT:Issuer"] ?? Environment.GetEnvironmentVariable("JWT__ISSUER");

// Dapper DB connection factory
builder.Services.AddSingleton<IDbConnectionFactory, DapperConnectionFactory>();
builder.Services.AddScoped<IDbConnection>(sp =>
{
    var factory = sp.GetRequiredService<IDbConnectionFactory>();
    var connn = factory.CreateConnection();
    return connn;
});

// Redis connection
// in-memory cache registration (used when Redis not configured)
builder.Services.AddMemoryCache();

if (!string.IsNullOrEmpty(redisConn))
{
    var mux = ConnectionMultiplexer.Connect(redisConn);
    builder.Services.AddSingleton<IConnectionMultiplexer>(mux);
}

// Application services
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<MegaSimulator.Application.Interfaces.IContactService, MegaSimulator.Application.Services.ContactService>();
builder.Services.AddScoped<ISimulationService, SimulationService>();
builder.Services.AddScoped<IFormulaService, FormulaService>();
// Params loader and typed params
builder.Services.AddSingleton<IParamsLoader, ParamsLoader>();
builder.Services.AddSingleton(sp => sp.GetRequiredService<IParamsLoader>().Load());
builder.Services.AddScoped<PayrollService>();
builder.Services.AddScoped<MegaSimulator.Application.Interfaces.IRetirementService, MegaSimulator.Application.Services.RetirementService>();
builder.Services.AddScoped<MegaSimulator.Application.Interfaces.ILoanService, MegaSimulator.Application.Services.LoanService>();
builder.Services.AddScoped<MegaSimulator.Application.Interfaces.ISavingsService, MegaSimulator.Application.Services.SavingsService>();
// Infrastructure repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IContactRepository, ContactRequestRepository>();
builder.Services.AddScoped<ISimulationRepository, SimulationRepository>();
builder.Services.AddScoped<IFormulaRepository, FormulaRepository>();
// Google OAuth client (typed HttpClient for GoogleAuthClient)
builder.Services.AddHttpClient<MegaSimulator.Application.Interfaces.IGoogleAuthClient, MegaSimulator.Infrastructure.Services.GoogleAuthClient>();

// Migration runner
builder.Services.AddScoped<IMigrationRunner, MigrationRunner>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Rate limiting (protect anonymous endpoints + auth)
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = 429;

    options.AddPolicy("contact", httpContext =>
        System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                PermitLimit = 5,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy("auth", httpContext =>
        System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                PermitLimit = 10,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));

    options.AddPolicy("simulate", httpContext =>
        System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
            partitionKey: httpContext.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
            {
                PermitLimit = 15,
                Window = TimeSpan.FromMinutes(1),
                QueueLimit = 0
            }));
});

// JWT Authentication
if (!string.IsNullOrEmpty(jwtKey))
{
    // Ensure the validation key is derived the same way tokens are signed in AuthService.
    var keyBytes = System.Text.Encoding.ASCII.GetBytes(jwtKey);
    if (keyBytes.Length < 32)
    {
        using var sha = System.Security.Cryptography.SHA256.Create();
        keyBytes = sha.ComputeHash(System.Text.Encoding.UTF8.GetBytes(jwtKey));
    }

    builder.Services.AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
        options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    }).AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
        options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
        {
            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(keyBytes)
        };
    });

    builder.Services.AddAuthorization();
}

var app = builder.Build();

// run migrations at startup
using (var scope = app.Services.CreateScope())
{
    // Try direct-run of migrations from repo (fallback if MigrationRunner can't find folder)
    var factory = scope.ServiceProvider.GetService<IDbConnectionFactory>();
    var migrator = scope.ServiceProvider.GetService<IMigrationRunner>();

    var repoMigrations1 = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "src", "Infrastructure", "Migrations");
    var repoMigrations2 = System.IO.Path.Combine(System.IO.Directory.GetCurrentDirectory(), "..", "Infrastructure", "Migrations");
    var repoMigrations = System.IO.Directory.Exists(repoMigrations1) ? repoMigrations1 : repoMigrations2;
    if (System.IO.Directory.Exists(repoMigrations) && factory != null)
    {
        var files = System.IO.Directory.GetFiles(repoMigrations, "*.sql");
        Array.Sort(files);
        using var conn = factory.CreateConnection();
        if (conn is System.Data.Common.DbConnection dbConn)
        {
            await dbConn.OpenAsync();
        }
        else
        {
            conn.Open();
        }
        foreach (var f in files)
        {
            var sql = await System.IO.File.ReadAllTextAsync(f);
            var logger = scope.ServiceProvider.GetService<Microsoft.Extensions.Logging.ILoggerFactory>()?.CreateLogger("StartupMigrations");
            logger?.LogInformation("Applying migration (direct) {file}", f);
            await conn.ExecuteAsync(sql);
        }
    }

    if (migrator != null)
    {
        await migrator.MigrateAsync();
    }

        // Ensure admin user exists and password matches known dev default (BCrypt may differ by runtime version)
        try
        {
            using var conn2 = factory?.CreateConnection();
            if (conn2 != null)
            {
                if (conn2 is System.Data.Common.DbConnection dbConn2) await dbConn2.OpenAsync(); else conn2.Open();
                var logger2 = scope.ServiceProvider.GetService<Microsoft.Extensions.Logging.ILoggerFactory>()?.CreateLogger("Startup");
                var plain = "111aaa**";
                var adminId = System.Guid.Parse("00000000-0000-0000-0000-000000000001");
                var adminCount = await conn2.ExecuteScalarAsync<long>("SELECT COUNT(*)::bigint FROM users WHERE username = @Username", new { Username = "admin" });
                if (adminCount == 0)
                {
                    var newHash = BCrypt.Net.BCrypt.HashPassword(plain);
                    var idTaken = await conn2.ExecuteScalarAsync<long>("SELECT COUNT(*)::bigint FROM users WHERE id = @Id", new { Id = adminId });
                    if (idTaken > 0)
                    {
                        await conn2.ExecuteAsync(@"
UPDATE users SET username = @Username, email = @Email, password_hash = @Hash, roles = ARRAY['admin']::text[],
  first_name = COALESCE(NULLIF(BTRIM(COALESCE(first_name, '')), ''), 'Admin'),
  last_name = COALESCE(NULLIF(BTRIM(COALESCE(last_name, '')), ''), 'User')
WHERE id = @Id",
                            new { Id = adminId, Username = "admin", Email = "admin@megasimulateur.org", Hash = newHash });
                        logger2?.LogInformation("Repaired admin row (id present but username was not admin); password set to dev default.");
                    }
                    else
                    {
                        await conn2.ExecuteAsync(@"
INSERT INTO users (id, username, email, created_at, password_hash, roles, first_name, last_name, phone)
VALUES (@Id, @Username, @Email, now(), @Hash, ARRAY['admin']::text[], 'Admin', 'User', @Phone)",
                            new { Id = adminId, Username = "admin", Email = "admin@megasimulateur.org", Hash = newHash, Phone = string.Empty });
                        logger2?.LogInformation("Created missing admin user (username admin, password dev default).");
                    }
                }
                else
                {
                    var existing = await conn2.QueryFirstOrDefaultAsync<string>("SELECT password_hash FROM users WHERE username = @Username", new { Username = "admin" });
                    var needsUpdate = existing == null || !BCrypt.Net.BCrypt.Verify(plain, existing);
                    if (needsUpdate)
                    {
                        var newHash = BCrypt.Net.BCrypt.HashPassword(plain);
                        await conn2.ExecuteAsync("UPDATE users SET password_hash = @Hash, roles = ARRAY['admin'] WHERE username = @Username", new { Hash = newHash, Username = "admin" });
                        logger2?.LogInformation("Admin password hash updated at startup to match runtime BCrypt implementation.");
                    }
                }
            }
        }
        catch (Exception ex)
        {
            var logger2 = scope.ServiceProvider.GetService<Microsoft.Extensions.Logging.ILoggerFactory>()?.CreateLogger("Startup");
            logger2?.LogWarning(ex, "Failed to ensure admin password at startup");
        }

    }

var enableSwagger = app.Environment.IsDevelopment() || builder.Configuration.GetValue<bool>("ENABLE_SWAGGER", false);
if (enableSwagger)
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
