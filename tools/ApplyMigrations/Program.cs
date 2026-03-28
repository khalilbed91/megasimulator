using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Dapper;
using Npgsql;

if (args.Length == 0)
{
    Console.WriteLine("Usage: dotnet run --project tools/ApplyMigrations -- \"<connection-string>\"");
    return;
}

var connStr = args[0];
var workspace = Directory.GetCurrentDirectory();
var migrations = Path.GetFullPath(Path.Combine(workspace, "..", "src", "Infrastructure", "Migrations"));
if (!Directory.Exists(migrations))
{
    Console.WriteLine("Migrations folder not found at: " + migrations);
    return;
}

var files = Directory.GetFiles(migrations, "*.sql").OrderBy(f => f).ToArray();
Console.WriteLine($"Found {files.Length} migration(s) in {migrations}");

await using var conn = new NpgsqlConnection(connStr);
await conn.OpenAsync();
foreach (var f in files)
{
    var sql = await File.ReadAllTextAsync(f);
    Console.WriteLine("Applying " + Path.GetFileName(f));
    await conn.ExecuteAsync(sql);
}
Console.WriteLine("Migrations applied.");
var users = (await conn.QueryAsync("SELECT id, username, email, roles, password_hash FROM users LIMIT 10")).ToList();
Console.WriteLine($"Users after migrations: {users.Count}");
foreach(var u in users)
{
    Console.WriteLine(u);
}
