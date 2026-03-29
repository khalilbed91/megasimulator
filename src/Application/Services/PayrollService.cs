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
        private readonly Domain.Interfaces.ISimulationRepository? _simulationRepository;

        public PayrollService(IFormulaService formulaService, PayrollParams @params, Domain.Interfaces.ISimulationRepository? simulationRepository = null)
        {
            _formulaService = formulaService;
            _params = @params;
            _simulationRepository = simulationRepository;
        }

        // Backwards-compatible constructor used by tests/mocks that supply only two args
        public PayrollService(IFormulaService formulaService, PayrollParams @params) : this(formulaService, @params, null)
        {
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

            // If there are no params for detailed rules, keep the original simple fallback
            if (_params == null || _params.CsgCrds == null)
            {
                var pct = statut == "cadre" ? 0.219m : 0.217m;
                return brut - (brut * pct);
            }

            // Use parameter-driven calculation: salary contributions + CSG non-deductible
            var salaryPct = statut == "cadre" ? 0.219m : 0.217m;
            var socialContrib = brut * salaryPct;
            var (baseCsg, csgDeductible, csgNonDed) = ComputeCsgComponents(brut);

            // Net = Brut - salary contributions - CSG non-deductible (CSG deductible handled elsewhere)
            var net = brut - socialContrib - csgNonDed;
            return decimal.Round(net, 2);
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

        // New: full simulate flow returns detailed DTO and persists simulation when repository available
        public virtual async Task<MegaSimulator.Application.DTOs.PayrollResponseDto> Simulate(MegaSimulator.Application.DTOs.PayrollRequestDto req, System.Guid? userId = null)
        {
            // Effective monthly brut = declared brut + monthly avantages + monthly primes
            var brut = req.Brut + req.RevenusAnnexes + req.Primes;
            var statut = req.Statut ?? "non-cadre";

            var netBeforeRetenue = await BrutToNet(brut, statut);
            // Apply withholding (retenue) if provided in request
            var retenuePct = req.RetenuePct;
            decimal retenueAmount = 0m;
            var net = netBeforeRetenue;
            if (retenuePct > 0)
            {
                retenueAmount = decimal.Round(net * (retenuePct / 100m), 2);
                net = decimal.Round(net - retenueAmount, 2);
            }
            else if (req.Parts > 0)
            {
                // Compute PAS (Prélèvement à la Source) from parts fiscales (barème 2026)
                var estimatedRetenuePct = ComputePasTaux(net * 12m, req.Parts);
                if (estimatedRetenuePct > 0)
                {
                    retenuePct = estimatedRetenuePct;
                    retenueAmount = decimal.Round(net * (retenuePct / 100m), 2);
                    net = decimal.Round(net - retenueAmount, 2);
                }
            }
            var employerCost = await EmployerCost(brut);
            var (csgBase, csgDed, csgNonDed) = ComputeCsgComponents(brut);
            var agirc = ComputeAgircArrcoContribution(brut);
            var jei = IsJeiEligible(brut);

            var socialContribution = decimal.Round(brut - net, 2);

            var response = new MegaSimulator.Application.DTOs.PayrollResponseDto
            {
                Net = net,
                NetMonthly = net,
                NetImposable = netBeforeRetenue,
                Parts = req.Parts,
                EmployerCost = employerCost,
                SocialContribution = socialContribution,
                CsgBase = csgBase,
                CsgDeductible = csgDed,
                CsgNonDeductible = csgNonDed,
                AgircArrco = agirc,
                IsJeiEligible = jei,
                RetenuePct = retenuePct,
                RetenueAmount = retenueAmount,
                NetAfterRetenue = net
            };

            if (_simulationRepository != null)
            {
                var sim = new Domain.Entities.Simulation
                {
                    Id = System.Guid.NewGuid(),
                    UserId = userId, // nullable: store NULL for anonymous simulations
                    Name = "Payroll simulation",
                    Type = "payroll",
                    Payload = System.Text.Json.JsonSerializer.Serialize(new { Request = req, Response = response }),
                    IsActive = true,
                    CreatedAt = System.DateTime.UtcNow
                };

                try
                {
                    await _simulationRepository.AddAsync(sim);
                }
                catch
                {
                    // swallow persistence errors to keep simulate non-blocking
                }
            }

            return response;
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

        // Detailed CSG/CRDS breakdown using params (returns base, deductible, non-deductible)
        public (decimal baseCsg, decimal csgDeductible, decimal csgNonDeductible) ComputeCsgComponents(decimal brut)
        {
            var c = _params?.CsgCrds;
            if (c == null)
            {
                var baseCsg = brut * 0.9825m; // default 98.25%
                return (baseCsg, baseCsg * 0.068m, baseCsg * 0.029m);
            }

            var assiettePct = (decimal)c.assiette_pct / 100m;
            var baseC = brut * assiettePct;
            var ded = baseC * (decimal)c.csg_deductible_pct;
            var nonDed = baseC * (decimal)c.csg_non_deductible_pct;
            return (baseC, ded, nonDed);
        }

        // Agirc-Arrco estimated contributions (uses tranche logic and PMSS)
        public decimal ComputeAgircArrcoContribution(decimal brut)
        {
            var a = _params?.AgircArrco;
            var pmss = _params?.Pmss?.monthly ?? 0.0;
            if (a == null)
            {
                // fallback: simple pct on brut
                return brut * 0.0787m;
            }

            var tranche1Pct = (decimal)a.tranche1_pct;
            var tranche2Pct = (decimal)a.tranche2_pct;
            var t1Base = Math.Min(brut, (decimal)pmss);
            var t2Base = Math.Max(0, brut - (decimal)pmss);
            var contrib = t1Base * tranche1Pct + t2Base * tranche2Pct;
            return contrib;
        }

        // JEI eligibility check (based on PMSS or manual plafond)
        public bool IsJeiEligible(decimal brut)
        {
            var pmss = _params?.Pmss?.monthly ?? 0.0;
            var jei = _params?.Jei;
            var manualPlafond = jei?.jei_plafond_manual ?? 0.0;
            var derived = (decimal)pmss * 2m;
            var plafond = manualPlafond > 0 ? (decimal)manualPlafond : derived;
            return brut <= plafond;
        }

        // Freelance conversion: CA -> estimated net after charges for common regimes
        public decimal FreelanceCaToNet(decimal ca, string regime = "services")
        {
            if (regime == "achat_rev")
            {
                // achat/revente
                return ca * (1 - 0.123m);
            }

            // services (BNC/BIC) use a mid value fallback
            var rate = 0.24m; // default between 21.2% and 25.6%
            return ca * (1 - rate);
        }

        /// <summary>
        /// Barème PAS 2026 ajusté au quotient familial.
        /// Calcule le taux de retenue à la source en fonction du revenu net annuel
        /// et du nombre de parts fiscales (foyer fiscal).
        /// </summary>
        public decimal ComputePasTaux(decimal netAnnuel, decimal parts)
        {
            if (parts <= 0) parts = 1m;

            // Revenu par part (quotient familial)
            var qf = netAnnuel / parts;

            // Barème PAS 2026 (tranches sur revenu net par part)
            decimal taux;
            if      (qf <= 14_490m)  taux = 0m;
            else if (qf <= 21_917m)  taux = 2m;
            else if (qf <= 31_425m)  taux = 7.5m;
            else if (qf <= 58_360m)  taux = 14m;
            else if (qf <= 80_669m)  taux = 22m;
            else if (qf <= 177_106m) taux = 30m;
            else                     taux = 41m;

            return taux;
        }
    }
}
