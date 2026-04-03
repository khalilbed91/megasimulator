using System;
using System.Text.Json;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Interfaces;

namespace MegaSimulator.Application.Services
{
    public class RetirementService : IRetirementService
    {
        private const decimal TauxPlein = 0.50m;
        private const decimal ValeurPointAgircArrco = 1.45m;
        private const decimal RetenueSocialePct = 0.091m;
        private const decimal DecoteSurcoteParTrimestre = 0.0125m;

        private readonly ISimulationRepository? _simulationRepository;

        public RetirementService(ISimulationRepository? simulationRepository = null)
        {
            _simulationRepository = simulationRepository;
        }

        /// <summary>Âge légal simplifié (année entière). Ne modélise pas le cas 63 ans et 6 mois (certaines générations autour de 1961).</summary>
        public int GetAgeLegal(int anneeNaissance)
        {
            if (anneeNaissance <= 1954) return 62;
            if (anneeNaissance <= 1960) return 63;
            // Réforme 2023 : à partir de 1961, âge légal affiché 64 ans (approximation — voir retirement.md)
            return 64;
        }

        public int GetTrimestresRequis(int anneeNaissance)
        {
            if (anneeNaissance <= 1952) return 164;
            if (anneeNaissance == 1953) return 165;
            if (anneeNaissance == 1954) return 165;
            if (anneeNaissance == 1955 || anneeNaissance == 1956) return 166;
            if (anneeNaissance == 1957 || anneeNaissance == 1958) return 167;
            if (anneeNaissance == 1959 || anneeNaissance == 1960) return 168;
            if (anneeNaissance == 1961 || anneeNaissance == 1962) return 169;
            if (anneeNaissance == 1963) return 170;
            if (anneeNaissance == 1964) return 171;
            // 1965 et après (barème 2026 — voir docs/knowledge-base/retirement.md)
            return 172;
        }

        public decimal ComputeDecote(int trimestresValides, int trimestresRequis)
        {
            var manquants = Math.Max(0, trimestresRequis - trimestresValides);
            var decote = manquants * DecoteSurcoteParTrimestre;
            // Décote plafonnée à 25% (20 trimestres max)
            return Math.Min(decote, 0.25m);
        }

        public decimal ComputeSurcote(int trimestresValides, int trimestresRequis)
        {
            var supplementaires = Math.Max(0, trimestresValides - trimestresRequis);
            return supplementaires * DecoteSurcoteParTrimestre;
        }

        private (decimal pensionBase, decimal pensionCompl, decimal pensionBrute, decimal pensionNette, decimal pensionNetteMensuelle)
            ComputePensionSnapshot(decimal sam, int trimVal, int trimReq, decimal points)
        {
            var decote = ComputeDecote(trimVal, trimReq);
            var surcote = ComputeSurcote(trimVal, trimReq);
            var facteur = trimReq > 0
                ? Math.Min(1m, (decimal)trimVal / trimReq)
                : 1m;

            var pensionBase = decimal.Round(sam * TauxPlein * facteur * (1 - decote) * (1 + surcote), 2);
            var pensionCompl = decimal.Round(points * ValeurPointAgircArrco, 2);
            var pensionBrute = pensionBase + pensionCompl;
            var pensionNette = decimal.Round(pensionBrute * (1 - RetenueSocialePct), 2);
            var pensionNetteMensuelle = decimal.Round(pensionNette / 12m, 2);
            return (pensionBase, pensionCompl, pensionBrute, pensionNette, pensionNetteMensuelle);
        }

        public async Task<RetirementResponseDto> Simulate(RetirementRequestDto req, Guid? userId = null)
        {
            var trimReqis = req.TrimestresRequis > 0
                ? req.TrimestresRequis
                : GetTrimestresRequis(req.AnneeNaissance);

            var trimVal = req.TrimestresValides;
            var manquants = Math.Max(0, trimReqis - trimVal);
            var decote = ComputeDecote(trimVal, trimReqis);
            var surcote = ComputeSurcote(trimVal, trimReqis);

            var sam = req.SalaireAnnuelMoyen;
            var points = req.PointsComplementaires;

            var (pensionBase, pensionCompl, pensionBrute, pensionNette, pensionNetteMensuelle) =
                ComputePensionSnapshot(sam, trimVal, trimReqis, points);

            // Reference: all required quarters validated (taux plein « au compte », sans surcote)
            var (_, _, _, pensionNettePlein, pensionNetteMensuellePlein) =
                ComputePensionSnapshot(sam, trimReqis, trimReqis, points);

            var ageDepart = req.AgeDepart > 0 ? req.AgeDepart : GetAgeLegal(req.AnneeNaissance);
            var anneeDepart = req.AnneeNaissance + ageDepart;
            var ageLegalPivot = GetAgeLegal(req.AnneeNaissance);
            var potentielVersPlein = decimal.Round(pensionNetteMensuellePlein - pensionNetteMensuelle, 2);
            var anneesIndicativesPlein = manquants > 0 ? (int)Math.Ceiling(manquants / 4.0) : 0;

            decimal tauxRemplacement = 0m;
            if (req.RevenusAnnuelsActuels > 0)
            {
                var revMensuel = req.RevenusAnnuelsActuels / 12m;
                tauxRemplacement = revMensuel > 0
                    ? decimal.Round(pensionNetteMensuelle / revMensuel * 100m, 1)
                    : 0m;
            }

            int? trimAddObjectif = null;
            int? anneesIndicObjectif = null;
            var objectifAtteignable = true;
            if (req.ObjectifPensionMensuelleNet is { } objectif && objectif > 0)
            {
                if (pensionNetteMensuelle >= objectif)
                {
                    trimAddObjectif = 0;
                    anneesIndicObjectif = 0;
                    objectifAtteignable = true;
                }
                else
                {
                    objectifAtteignable = false;
                    const int maxScan = 400;
                    for (var tv = trimVal + 1; tv <= trimVal + maxScan; tv++)
                    {
                        var netM = ComputePensionSnapshot(sam, tv, trimReqis, points).pensionNetteMensuelle;
                        if (netM < objectif) continue;
                        var add = tv - trimVal;
                        trimAddObjectif = add;
                        anneesIndicObjectif = (int)Math.Ceiling(add / 4.0);
                        objectifAtteignable = true;
                        break;
                    }
                }
            }

            var response = new RetirementResponseDto
            {
                PensionBaseAnnuelle = pensionBase,
                PensionComplementaireAnnuelle = pensionCompl,
                PensionBruteTotaleAnnuelle = pensionBrute,
                PensionNetteAnnuelle = pensionNette,
                PensionNetteMensuelle = pensionNetteMensuelle,
                TauxRemplacement = tauxRemplacement,
                TrimestresValides = trimVal,
                TrimestresRequis = trimReqis,
                TrimestresManquants = manquants,
                DecotePct = decimal.Round(decote * 100m, 2),
                SurcotePct = decimal.Round(surcote * 100m, 2),
                Sam = sam,
                ValeurPoint = ValeurPointAgircArrco,
                AgeDepart = ageDepart,
                AnneeDepartRetraite = anneeDepart,
                AgeLegalPivot = ageLegalPivot,
                PensionNetteMensuelleTauxPleinTrimestres = pensionNetteMensuellePlein,
                PensionNetteAnnuelleTauxPleinTrimestres = pensionNettePlein,
                PotentielMensuelVersTauxPlein = potentielVersPlein,
                AnneesIndicativesPourTauxPlein = anneesIndicativesPlein,
                TrimestresAdditionnelsPourObjectif = trimAddObjectif,
                AnneesIndicativesPourObjectif = anneesIndicObjectif,
                ObjectifAtteignable = objectifAtteignable
            };

            if (_simulationRepository != null)
            {
                var sim = new Domain.Entities.Simulation
                {
                    Id = Guid.NewGuid(),
                    UserId = userId,
                    Name = "Retirement simulation",
                    Type = "retirement",
                    Payload = JsonSerializer.Serialize(new { Request = req, Response = response }),
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow
                };

                try { await _simulationRepository.AddAsync(sim); }
                catch { /* non-blocking */ }
            }

            return response;
        }
    }
}
