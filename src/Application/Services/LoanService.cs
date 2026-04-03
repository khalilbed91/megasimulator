using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;

namespace MegaSimulator.Application.Services
{
    public class LoanService : ILoanService
    {
        private const decimal HcsfMaxDebtRatio = 0.35m;
        private const decimal ResteAVivreMin = 800m;

        /// <summary>Plafonds revenus fiscaux de référence PTZ (indicatif 2026, zones A bis/A, B1, B2, C). Source : barèmes publics / décrets — à revalider officiellement.</summary>
        private static readonly decimal[,] PtzIncomeCapsEur =
        {
            { 49000m, 34500m, 31500m, 28500m },
            { 73500m, 51750m, 47250m, 42750m },
            { 88200m, 62100m, 56700m, 51300m },
            { 102900m, 72450m, 66150m, 59850m },
            { 117600m, 82800m, 75600m, 68400m }
        };

        /// <summary>Montant PTZ max indicatif par zone (€) — ordre AbisA, B1, B2, C. Simplifié pédagogique ; le montant réel dépend de l&apos;opération et de la quotité.</summary>
        private static readonly decimal[] PtzAmountCapsByZone = { 120000m, 100000m, 80000m, 60000m };

        private const decimal PalMaxAmount = 40000m;

        private readonly ISimulationRepository? _simulationRepository;

        public LoanService(ISimulationRepository? simulationRepository = null)
        {
            _simulationRepository = simulationRepository;
        }

        /// <summary>
        /// Seuils d'usure Banque de France, crédits immobiliers aux personnes physiques, effet au 1er avril 2026 (publication T2 2026).
        /// Catégorie « Prêts à taux fixe » par tranche de durée. Prêt conso &gt; 6 000 € : 8,61 % (même vague).
        /// </summary>
        private static decimal ResolveUsuryThresholdPercent(string cat, int durationMonths)
        {
            if (string.Equals(cat, "immo", StringComparison.OrdinalIgnoreCase))
            {
                if (durationMonths >= 240) return 5.19m;
                if (durationMonths >= 120) return 4.48m;
                return 4.00m;
            }

            return 8.61m;
        }

        public decimal MonthlyAnnuity(decimal principal, decimal annualNominalPercent, int months)
        {
            if (principal <= 0 || months < 1) return 0m;
            var rm = (annualNominalPercent / 100m) / 12m;
            if (rm <= 0) return decimal.Round(principal / months, 2);
            var pow = (decimal)Math.Pow((double)(1m + rm), -months);
            return decimal.Round(principal * rm / (1m - pow), 2);
        }

        private static List<LoanScheduleRowDto> BuildSchedule(decimal principal, decimal annualNominalPercent, int months, decimal insuranceAnnualPercent)
        {
            var rows = new List<LoanScheduleRowDto>();
            if (principal <= 0 || months < 1) return rows;
            var r = (annualNominalPercent / 100m) / 12m;
            var insMo = decimal.Round(principal * (insuranceAnnualPercent / 100m) / 12m, 2);
            var balance = principal;
            decimal monthlyPi;
            if (r <= 0)
                monthlyPi = decimal.Round(principal / months, 2);
            else
            {
                var pow = (decimal)Math.Pow((double)(1m + r), -months);
                monthlyPi = principal * r / (1m - pow);
            }

            for (var m = 1; m <= months; m++)
            {
                decimal interest, princ;
                if (r <= 0)
                {
                    interest = 0m;
                    princ = m == months ? balance : monthlyPi;
                }
                else
                {
                    interest = decimal.Round(balance * r, 2);
                    princ = decimal.Round(monthlyPi - interest, 2);
                    if (m == months) princ = balance;
                }

                balance = decimal.Round(balance - princ, 2);
                if (balance < 0) balance = 0;
                rows.Add(new LoanScheduleRowDto
                {
                    Month = m,
                    PrincipalPart = princ,
                    InterestPart = interest,
                    InsurancePart = insMo,
                    Payment = decimal.Round(princ + interest + insMo, 2),
                    RemainingPrincipal = balance
                });
            }

            return rows;
        }

        private static int ZoneColumn(string? zone)
        {
            var z = (zone ?? "B2").Trim();
            if (string.Equals(z, "AbisA", StringComparison.OrdinalIgnoreCase) || string.Equals(z, "A", StringComparison.OrdinalIgnoreCase))
                return 0;
            if (string.Equals(z, "B1", StringComparison.OrdinalIgnoreCase)) return 1;
            if (string.Equals(z, "B2", StringComparison.OrdinalIgnoreCase)) return 2;
            return 3;
        }

        private static (decimal capIncome, decimal capPtz) GetPtzCaps(int householdPersons, string? zone)
        {
            var col = ZoneColumn(zone);
            var row = Math.Clamp(householdPersons, 1, 5) - 1;
            var capIncome = PtzIncomeCapsEur[row, col];
            var capPtz = PtzAmountCapsByZone[col];
            return (capIncome, capPtz);
        }

        private static decimal NotaryPctFor(string? tvaRegime)
        {
            var r = (tvaRegime ?? "ancien").ToLowerInvariant();
            return r == "ancien" ? 7.5m : 2.0m;
        }

        private static decimal TvaPercentFor(string? tvaRegime)
        {
            return (tvaRegime ?? "ancien").ToLowerInvariant() switch
            {
                "neuf55" => 5.5m,
                "neuf10" => 10m,
                "neuf20" => 20m,
                _ => 0m
            };
        }

        public async Task<LoanResponseDto> Simulate(LoanRequestDto req, Guid? userId = null)
        {
            var warnings = new List<string>();
            var cat = (req.Category ?? "immo").Trim().ToLowerInvariant();
            if (cat != "perso" && cat != "auto" && cat != "immo") cat = "immo";

            decimal effectiveTtc;
            decimal notaryPct;
            decimal tvaPct;

            if (cat == "immo")
            {
                notaryPct = NotaryPctFor(req.TvaRegime);
                tvaPct = TvaPercentFor(req.TvaRegime);
                if (req.PriceHt is { } ht && ht > 0 && tvaPct > 0)
                    effectiveTtc = decimal.Round(ht * (1m + tvaPct / 100m), 2);
                else
                    effectiveTtc = req.PurchasePriceTtc;
            }
            else
            {
                notaryPct = 0m;
                tvaPct = 0m;
                effectiveTtc = req.Amount > 0 ? req.Amount : req.PurchasePriceTtc;
            }

            var notaryFees = cat == "immo"
                ? decimal.Round(effectiveTtc * (notaryPct / 100m), 2)
                : 0m;
            var totalProject = effectiveTtc + notaryFees;

            var ptzApplied = 0m;
            var palApplied = 0m;
            var ptzIncomeEligible = true;
            var ptzCapIncome = 0m;
            var ptzCapAmount = 0m;

            if (cat == "immo" && req.IncludePtz && req.PtzAmount > 0)
            {
                (ptzCapIncome, ptzCapAmount) = GetPtzCaps(Math.Max(1, req.HouseholdPersons), req.PtzZone);
                ptzIncomeEligible = req.FiscalReferenceIncome <= 0 || req.FiscalReferenceIncome <= ptzCapIncome;
                if (!ptzIncomeEligible)
                    warnings.Add($"PTZ : revenu fiscal de référence indicatif au-dessus du plafond zone ({ptzCapIncome:N0} € pour le ménage — barème pédagogique 2026).");

                ptzApplied = Math.Min(req.PtzAmount, ptzCapAmount);
                if (req.PtzAmount > ptzCapAmount)
                    warnings.Add($"PTZ : montant demandé ramené au plafond indicatif zone ({ptzCapAmount:N0} €).");

                if (!ptzIncomeEligible) ptzApplied = 0m;
            }

            if (cat == "immo" && req.IncludeActionLogement && req.ActionLogementAmount > 0)
            {
                palApplied = Math.Min(req.ActionLogementAmount, PalMaxAmount);
                if (req.ActionLogementAmount > PalMaxAmount)
                    warnings.Add($"Prêt Action Logement : montant plafonné à {PalMaxAmount:N0} € (hors cas HLM 40 k€).");
            }

            var bankK = totalProject - req.DownPayment - ptzApplied - palApplied;
            if (bankK < 0)
            {
                warnings.Add("Capital bancaire négatif : vérifiez apport, PTZ et Action Logement.");
                bankK = 0;
            }

            var n = Math.Max(1, req.DurationMonths);
            var monthlyBank = MonthlyAnnuity(bankK, req.NominalRateAnnualPercent, n);
            if (bankK <= 0) monthlyBank = 0m;

            var monthlyIns = bankK <= 0
                ? 0m
                : decimal.Round(bankK * (req.InsuranceAnnualPercent / 100m) / 12m, 2);

            var monthlyPal = 0m;
            if (palApplied > 0)
                monthlyPal = MonthlyAnnuity(palApplied, req.ActionLogementRateAnnualPercent, n);

            var defM = Math.Max(0, Math.Min(req.PtzDefermentMonths, n - 1));
            var ptzAmortMonths = n - defM;
            var monthlyPtzPostDefer = ptzApplied > 0 && ptzAmortMonths > 0
                ? decimal.Round(ptzApplied / ptzAmortMonths, 2)
                : 0m;

            var monthlySteady = monthlyBank + monthlyIns + monthlyPal + monthlyPtzPostDefer;

            decimal debtRatio = 0m;
            var hcsfOk = true;
            var ravOk = true;
            var rav = 0m;
            if (req.NetMonthlyIncome > 0)
            {
                debtRatio = decimal.Round((monthlySteady + req.OtherMonthlyCredits) / req.NetMonthlyIncome, 4);
                hcsfOk = debtRatio <= HcsfMaxDebtRatio;
                if (!hcsfOk)
                    warnings.Add($"Ratio d'endettement HCSF ({debtRatio * 100m:N1} %) supérieur à {HcsfMaxDebtRatio * 100m:F0} % (assurance et crédits inclus).");

                rav = req.NetMonthlyIncome - monthlySteady - req.OtherMonthlyCredits;
                ravOk = rav >= ResteAVivreMin;
                if (!ravOk)
                    warnings.Add($"Reste à vivre sous le seuil indicatif ({ResteAVivreMin:N0} €/mois).");
            }

            var feeSpread = bankK > 0 && n > 0
                ? (req.FileFees + req.GuaranteeFees) / bankK * (12m * 100m / (n / 12m))
                : 0m;
            if (n < 12) feeSpread = bankK > 0 ? (req.FileFees + req.GuaranteeFees) / bankK * 100m : 0m;

            var taegApprox = decimal.Round(
                req.NominalRateAnnualPercent + req.InsuranceAnnualPercent + feeSpread, 3);
            var usury = ResolveUsuryThresholdPercent(cat, n);
            var usuryOk = taegApprox <= usury;
            if (!usuryOk)
                warnings.Add($"TAEG approximatif ({taegApprox:N2} %) au-dessus du seuil d'usure indicatif ({usury:N2} %) — à vérifier par durée et trimestre Banque de France.");

            var schedule = BuildSchedule(bankK, req.NominalRateAnnualPercent, Math.Min(n, 360), req.InsuranceAnnualPercent);
            decimal totalInterest = 0m, totalIns = 0m;
            foreach (var row in schedule)
            {
                totalInterest += row.InterestPart;
                totalIns += row.InsurancePart;
            }

            var totalCost = totalInterest + totalIns + req.FileFees + req.GuaranteeFees;

            var preview = new List<LoanScheduleRowDto>();
            var take = Math.Min(24, schedule.Count);
            for (var i = 0; i < take; i++) preview.Add(schedule[i]);

            var resp = new LoanResponseDto
            {
                Category = cat,
                TvaRegime = req.TvaRegime,
                TvaRateAppliedPercent = tvaPct,
                EffectivePurchaseTtc = effectiveTtc,
                NotaryFees = notaryFees,
                NotaryFeesPercent = notaryPct,
                TotalProjectBeforeBank = totalProject,
                BankPrincipal = bankK,
                PtzAmountApplied = ptzApplied,
                ActionLogementAmountApplied = palApplied,
                MonthlyBankPrincipalInterest = monthlyBank,
                MonthlyInsurance = monthlyIns,
                MonthlyActionLogement = monthlyPal,
                MonthlyPtz = monthlyPtzPostDefer,
                MonthlyTotalSteadyState = monthlySteady,
                PtzDefermentMonths = defM,
                PtzIncomeEligible = ptzIncomeEligible,
                PtzIncomeCapReference = ptzCapIncome,
                PtzAmountCapReference = ptzCapAmount,
                DebtRatio = debtRatio * 100m,
                HcsfDebtRatioOk = hcsfOk,
                HcsfResteAVivreOk = ravOk,
                ResteAVivre = decimal.Round(rav, 2),
                TaegApproximatePercent = taegApprox,
                UsuryThresholdPercent = usury,
                UsuryOk = usuryOk,
                TotalInterestBank = decimal.Round(totalInterest, 2),
                TotalInsurance = decimal.Round(totalIns, 2),
                TotalCostOfCredit = decimal.Round(totalCost, 2),
                Warnings = warnings,
                SchedulePreview = preview
            };

            if (_simulationRepository != null)
            {
                var sim = new Simulation
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = "Loan simulation",
                    Type = "loan",
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
