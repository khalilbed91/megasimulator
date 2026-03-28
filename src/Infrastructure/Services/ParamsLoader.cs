using System.IO;
using System.Text.Json;
using Microsoft.Extensions.Configuration;
using MegaSimulator.Application.Params;

namespace MegaSimulator.Infrastructure.Services
{
    public interface IParamsLoader
    {
        PayrollParams Load();
    }

    public class ParamsLoader : IParamsLoader
    {
        private readonly string _path;

        public ParamsLoader(IConfiguration config)
        {
            _path = config["PARAMS_FILE"] ?? Path.Combine("docs", "knowledge-base", "params", "2026.json");
        }

        public PayrollParams Load()
        {
            if (!File.Exists(_path)) return new PayrollParams();
            var text = File.ReadAllText(_path);
            var opts = new JsonSerializerOptions { PropertyNameCaseInsensitive = true };
            return JsonSerializer.Deserialize<PayrollParams>(text, opts) ?? new PayrollParams();
        }
    }
}
