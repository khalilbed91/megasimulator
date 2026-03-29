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

        public int GetAgeLegal(int anneeNaissance)
        {
            if (anneeNaissance <= 1954) return 62;
            if (anneeNaissance <= 1960) return 63;
            // Réforme 2023 : génération 1961+ → 64 ans
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
            // 1963 et après
            return 170;
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

        public async Task<RetirementResponseDto> Simulate(RetirementRequestDto req, Guid? userId = null)
        {
            var trimReqis = req.TrimestresRequis > 0
                ? req.TrimestresRequis
                : GetTrimestresRequis(req.AnneeNaissance);

            var trimVal = req.TrimestresValides;
            var manquants = Math.Max(0, trimReqis - trimVal);
            var decote = ComputeDecote(trimVal, trimReqis);
            var surcote = ComputeSurcote(trimVal, trimReqis);

            // Facteur trimestres: plafonné à 1 si surcote (on ne réduit pas la base)
            var facteur = trimReqis > 0
                ? Math.Min(1m, (decimal)trimVal / trimReqis)
                : 1m;

            var sam = req.SalaireAnnuelMoyen;

            // Pension base CNAV
            var pensionBase = sam * TauxPlein * facteur * (1 - decote) * (1 + surcote);
            pensionBase = decimal.Round(pensionBase, 2);

            // Pension complémentaire Agirc-Arrco
            var pensionCompl = req.PointsComplementaires * ValeurPointAgircArrco;
            pensionCompl = decimal.Round(pensionCompl, 2);

            var pensionBrute = pensionBase + pensionCompl;
            var pensionNette = decimal.Round(pensionBrute * (1 - RetenueSocialePct), 2);
            var pensionNetteMensuelle = decimal.Round(pensionNette / 12m, 2);

            decimal tauxRemplacement = 0m;
            if (req.RevenusAnnuelsActuels > 0)
            {
                var revMensuel = req.RevenusAnnuelsActuels / 12m;
                tauxRemplacement = revMensuel > 0
                    ? decimal.Round(pensionNetteMensuelle / revMensuel * 100m, 1)
                    : 0m;
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
                ValeurPoint = ValeurPointAgircArrco
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
