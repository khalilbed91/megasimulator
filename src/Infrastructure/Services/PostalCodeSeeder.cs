using System.Data;
using System.Text;
using Dapper;
using MegaSimulator.Infrastructure.Persistence;
using Npgsql;

namespace MegaSimulator.Infrastructure.Services
{
    public class PostalCodeSeeder
    {
        private readonly IDbConnectionFactory _factory;

        public PostalCodeSeeder(IDbConnectionFactory factory)
        {
            _factory = factory;
        }

        public async Task SeedAsync()
        {
            var path = ResolveSeedPath();
            if (path == null) return;

            using var conn = _factory.CreateConnection();
            if (conn is not NpgsqlConnection npgsql)
            {
                conn.Open();
                var existing = await conn.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM france_postal_codes");
                if (existing > 30000) return;
                return;
            }

            await npgsql.OpenAsync();
            var count = await npgsql.ExecuteScalarAsync<int>("SELECT COUNT(*) FROM france_postal_codes");
            if (count > 30000) return;

            await npgsql.ExecuteAsync(@"
CREATE TEMP TABLE tmp_france_postal_codes_import (
    code_commune_insee text,
    nom_de_la_commune text,
    code_postal text,
    libelle_d_acheminement text,
    ligne_5 text,
    geopoint text,
    latitude text,
    longitude text
);");

            await using (var writer = await npgsql.BeginTextImportAsync(@"
COPY tmp_france_postal_codes_import (
    code_commune_insee,
    nom_de_la_commune,
    code_postal,
    libelle_d_acheminement,
    ligne_5,
    geopoint,
    latitude,
    longitude
) FROM STDIN WITH (FORMAT CSV, HEADER TRUE, QUOTE '""');"))
            {
                var csv = await File.ReadAllTextAsync(path, Encoding.UTF8);
                await writer.WriteAsync(csv);
            }

            await npgsql.ExecuteAsync(@"
INSERT INTO france_postal_codes (
    postal_code,
    city,
    department_code,
    department_name,
    region_name,
    zone_factor
)
SELECT DISTINCT
    code_postal,
    initcap(lower(coalesce(nullif(libelle_d_acheminement, ''), nom_de_la_commune))),
    CASE
        WHEN code_commune_insee LIKE '97%' OR code_commune_insee LIKE '98%' THEN substring(code_commune_insee from 1 for 3)
        ELSE substring(code_commune_insee from 1 for 2)
    END,
    CASE
        WHEN code_commune_insee LIKE '97%' OR code_commune_insee LIKE '98%' THEN substring(code_commune_insee from 1 for 3)
        ELSE substring(code_commune_insee from 1 for 2)
    END,
    '',
    CASE
        WHEN code_postal LIKE '75%' THEN 1.220
        WHEN code_postal LIKE '92%' THEN 1.200
        WHEN code_postal LIKE '93%' OR code_postal LIKE '94%' OR code_postal LIKE '95%' THEN 1.180
        WHEN code_postal LIKE '77%' OR code_postal LIKE '78%' OR code_postal LIKE '91%' THEN 1.120
        WHEN code_postal LIKE '06%' OR code_postal LIKE '13%' OR code_postal LIKE '31%' OR code_postal LIKE '33%' OR code_postal LIKE '34%' OR code_postal LIKE '44%' OR code_postal LIKE '59%' OR code_postal LIKE '67%' OR code_postal LIKE '69%' THEN 1.120
        ELSE 1.000
    END
FROM tmp_france_postal_codes_import
WHERE code_postal IS NOT NULL
  AND btrim(code_postal) <> ''
  AND coalesce(nullif(libelle_d_acheminement, ''), nom_de_la_commune) IS NOT NULL
ON CONFLICT (postal_code, city) DO UPDATE SET
    department_code = EXCLUDED.department_code,
    department_name = EXCLUDED.department_name,
    region_name = EXCLUDED.region_name,
    zone_factor = EXCLUDED.zone_factor;");
        }

        private static string? ResolveSeedPath()
        {
            var candidates = new[]
            {
                Path.Combine(Directory.GetCurrentDirectory(), "src", "Infrastructure", "SeedData", "france_postal_codes_official.csv"),
                Path.Combine(Directory.GetCurrentDirectory(), "..", "Infrastructure", "SeedData", "france_postal_codes_official.csv"),
                Path.Combine(AppContext.BaseDirectory, "SeedData", "france_postal_codes_official.csv")
            };

            return candidates.FirstOrDefault(File.Exists);
        }
    }
}
