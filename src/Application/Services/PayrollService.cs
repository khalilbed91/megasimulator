using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Application.Params;

namespace MegaSimulator.Application.Services
{
    public class PayrollService
    {
        private readonly IFormulaService _formulaService;
        private readonly PayrollParams _params;

        public PayrollService(IFormulaService formulaService, PayrollParams @params)
        {
            _formulaService = formulaService;
            _params = @params;
        }

        // Simple brut->net using a percentage parameter or formula
        public virtual async Task<decimal> BrutToNet(decimal brut, string statut = "non-cadre")
        {
            // Try formula first
            var formula = await _formulaService.GetByNameAsync("brut_to_net_estimate");
            if (formula != null)
            {
                var vars = new Dictionary<string, object?> { { "Brut", (double)brut }, { "Statut", statut } };
                var res = await _formulaService.EvaluateAsync(formula.Expression, vars);
                if (res != null && decimal.TryParse(res.ToString(), out var v)) return v;
            }

            // fallback: use rough percentage from docs
            var pct = statut == "cadre" ? 0.219m : 0.217m;
            return brut - (brut * pct);
        }

        public virtual async Task<decimal> EmployerCost(decimal brut)
        {
            var formula = await _formulaService.GetByNameAsync("employer_cost_estimate");
            if (formula != null)
            {
                var vars = new Dictionary<string, object?> { { "Brut", (double)brut } };
                var res = await _formulaService.EvaluateAsync(formula.Expression, vars);
                if (res != null && decimal.TryParse(res.ToString(), out var v)) return v;
            }

            var pct = 0.45m; // fallback
            return brut * (1 + pct);
        }

        public virtual async Task<decimal> ComputeCDDPrime(decimal totalBruts)
        {
            var formula = await _formulaService.GetByNameAsync("cdd_prime_pct");
            if (formula != null)
            {
                var res = await _formulaService.EvaluateAsync(formula.Expression, new Dictionary<string, object?> { { "TotalBruts", (double)totalBruts } });
                if (res != null && decimal.TryParse(res.ToString(), out var v)) return v;
            }

            return totalBruts * 0.10m; // default 10%
        }
    }
}
