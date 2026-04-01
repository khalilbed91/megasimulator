using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Application.Params;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;

namespace MegaSimulator.Application.Services
{
    public class SavingsService : ISavingsService
    {
        private readonly PayrollParams _params;
        private readonly ISimulationRepository? _simulationRepository;

        public SavingsService(PayrollParams @params, ISimulationRepository? simulationRepository = null)
        {
            _params = @params;
            _simulationRepository = simulationRepository;
        }

        private static decimal Pow1Plus(decimal monthlyRate, int months)
        {
            if (months <= 0) return 1m;
            var b = (double)(1m + monthlyRate);
            return (decimal)Math.Pow(b, months);
        }

        /// <summary>Objectif indexé sur l’horizon : O × (1 + i)^(N/12)</summary>
        public static decimal ComputeIndexedObjective(decimal objective, decimal inflationAnnual, int months)
        {
            if (objective <= 0 || months < 1) return 0m;
            var years = months / 12m;
            var factor = (decimal)Math.Pow((double)(1m + inflationAnnual), (double)years);
            return decimal.Round(objective * factor, 2);
        }

        /// <summary>Versement mensuel fin de mois pour atteindre targetFv en N mois, avec capital initial capitalisé.</summary>
        public static decimal RequiredMonthlyContribution(
            decimal targetFv,
            decimal nominalAnnual,
            int months,
            decimal initialLumpSum)
        {
            if (months < 1 || targetFv <= 0) return 0m;
            var i = nominalAnnual / 12m;
            var fv0 = initialLumpSum <= 0 ? 0m : initialLumpSum * Pow1Plus(i, months);
            var remaining = targetFv - fv0;
            if (remaining <= 0) return 0m;
            if (i <= 0m) return decimal.Round(remaining / months, 2);
            var annuityFactor = (Pow1Plus(i, months) - 1m) / i;
            if (annuityFactor <= 0) return decimal.Round(remaining / months, 2);
            return decimal.Round(remaining / annuityFactor, 2);
        }

        public async Task<SavingsResponseDto> Simulate(SavingsRequestDto req, Guid? userId)
        {
            var warnings = new List<string>();
            var s = _params.Savings ?? new SavingsParams();

            var inflation = req.InflationAnnual ?? (decimal)s.InflationEstimate;
            var yield = req.NominalYieldAnnual ?? (decimal)s.LivretANominalAnnual;
            if (inflation < 0 || inflation > 0.25m)
                warnings.Add("Inflation hors plage habituelle — vérifiez la valeur saisie.");
            if (yield < 0 || yield > 0.2m)
                warnings.Add("Rendement hors plage habituelle — vérifiez la valeur saisie.");

            var months = Math.Clamp(req.HorizonMonths, 1, 600);
            if (req.HorizonMonths != months)
                warnings.Add($"Horizon ajusté à {months} mois (plage 1–600).");

            var objective = Math.Max(0m, req.ObjectiveEuros);
            if (objective <= 0)
                warnings.Add("Objectif nul ou absent — résultats à 0.");

            var indexed = ComputeIndexedObjective(objective, inflation, months);
            var initial = Math.Max(0m, req.InitialSavingsEuros);
            var required = RequiredMonthlyContribution(indexed, yield, months, initial);
            var current = Math.Max(0m, req.CurrentMonthlySavingsEuros);
            var gap = decimal.Round(required - current, 2);

            var presets = s.SwitchPresetsEurMonthly ?? new SwitchPresetsEurMonthly();
            var switches = new List<SavingsSwitchLineDto>
            {
                new()
                {
                    Id = "navigo_to_bike",
                    LabelFr = "Transport : forfait Navigo → vélo / Liberté+ (gain indicatif)",
                    LabelEn = "Transit pass → bike / lighter pass (indicative gain)",
                    MonthlyGainEuros = (decimal)presets.NavigoToBike,
                    Selected = req.SwitchNavigoToBike
                },
                new()
                {
                    Id = "telecom_optimize",
                    LabelFr = "Télécom : forfait optimisé (gain indicatif)",
                    LabelEn = "Phone & fiber optimized bundle",
                    MonthlyGainEuros = (decimal)presets.TelecomOptimize,
                    Selected = req.SwitchTelecomOptimize
                },
                new()
                {
                    Id = "meal_prep",
                    LabelFr = "Alimentation : meal prep vs livraisons (gain indicatif)",
                    LabelEn = "Meal prep vs delivery (indicative)",
                    MonthlyGainEuros = (decimal)presets.MealPrep,
                    Selected = req.SwitchMealPrep
                },
                new()
                {
                    Id = "subscriptions_bundle",
                    LabelFr = "Abonnements : regroupement / arbitrage (gain indicatif)",
                    LabelEn = "Streaming & subs bundle (indicative)",
                    MonthlyGainEuros = (decimal)presets.SubscriptionsBundle,
                    Selected = req.SwitchSubscriptionsBundle
                }
            };

            decimal switchTotal = 0m;
            foreach (var sw in switches)
                if (sw.Selected) switchTotal += sw.MonthlyGainEuros;

            var gapAfter = decimal.Round(gap - switchTotal, 2);
            var daily = required > 0 ? decimal.Round(required / 30m, 2) : 0m;

            decimal? clothing = null;
            if (req.AnnualNetIncomeEuros is { } inc && inc > 0)
            {
                var pct = (decimal)(s.ClothingPctOfAnnualNet > 0 ? s.ClothingPctOfAnnualNet : 0.05);
                clothing = decimal.Round(inc * pct / 12m, 2);
            }

            if (gap > 0 && months < 6)
                warnings.Add("Horizon court : l’effort mensuel est sensible ; envisagez d’allonger la durée.");

            var resp = new SavingsResponseDto
            {
                NominalObjectiveEuros = objective,
                IndexedObjectiveEuros = indexed,
                InflationAnnualUsed = inflation,
                NominalYieldAnnualUsed = yield,
                HorizonMonths = months,
                InitialSavingsEuros = initial,
                RequiredMonthlyEuros = required,
                CurrentMonthlySavingsEuros = current,
                GapEuros = gap,
                Switches = switches,
                TotalSelectedSwitchGainEuros = switchTotal,
                GapAfterSwitchesEuros = gapAfter,
                DailyEquivalentEuros = daily,
                ClothingBudgetMonthlyEuros = clothing,
                Warnings = warnings,
                ParamsSourceNote = s.SourceNote
            };

            if (_simulationRepository != null && objective > 0)
            {
                var sim = new Simulation
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = "Savings goal",
                    Type = "savings",
                    Payload = JsonSerializer.Serialize(new { Request = req, Response = resp }),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };
                try { await _simulationRepository.AddAsync(sim); }
                catch { /* non-blocking */ }
            }

            return resp;
        }
    }
}
