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
builder.Services.AddScoped<ISalaireService, SalaireService>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<ISimulationService, SimulationService>();
builder.Services.AddScoped<IFormulaService, FormulaService>();
// Params loader and typed params
builder.Services.AddSingleton<IParamsLoader, ParamsLoader>();
builder.Services.AddSingleton(sp => sp.GetRequiredService<IParamsLoader>().Load());
builder.Services.AddScoped<PayrollService>();
// Infrastructure repositories
builder.Services.AddScoped<ISalaireRepository, SalaireRepository>();
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<ISimulationRepository, SimulationRepository>();
builder.Services.AddScoped<IFormulaRepository, FormulaRepository>();
builder.Services.AddScoped<ISimulationResultRepository, SimulationResultRepository>();
// Google OAuth client (typed HttpClient for GoogleAuthClient)
builder.Services.AddHttpClient<MegaSimulator.Application.Interfaces.IGoogleAuthClient, MegaSimulator.Infrastructure.Services.GoogleAuthClient>();

// Migration runner
builder.Services.AddScoped<IMigrationRunner, MigrationRunner>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// JWT Authentication
if (!string.IsNullOrEmpty(jwtKey))
{
    var key = System.Text.Encoding.ASCII.GetBytes(jwtKey);
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
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(key)
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

        // Ensure seeded admin has a password hash compatible with the runtime BCrypt implementation
        try
        {
            using var conn2 = factory?.CreateConnection();
            if (conn2 != null)
            {
                if (conn2 is System.Data.Common.DbConnection dbConn2) await dbConn2.OpenAsync(); else conn2.Open();
                var existing = await conn2.QueryFirstOrDefaultAsync<string>("SELECT password_hash FROM users WHERE username = @Username", new { Username = "admin" });
                var plain = "111aaa**";
                var needsUpdate = existing == null || !BCrypt.Net.BCrypt.Verify(plain, existing);
                if (needsUpdate)
                {
                    var newHash = BCrypt.Net.BCrypt.HashPassword(plain);
                    await conn2.ExecuteAsync("UPDATE users SET password_hash = @Hash, roles = ARRAY['admin'] WHERE username = @Username", new { Hash = newHash, Username = "admin" });
                    var logger2 = scope.ServiceProvider.GetService<Microsoft.Extensions.Logging.ILoggerFactory>()?.CreateLogger("Startup");
                    logger2?.LogInformation("Admin password hash updated at startup to match runtime BCrypt implementation.");
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

app.MapControllers();

app.Run();
