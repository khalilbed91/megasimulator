using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Services;
using Xunit;

namespace MegaSimulator.Tests
{
    public class RetirementServiceTests
    {
        private static RetirementService CreateService() => new RetirementService();

        // ── GetTrimestresRequis ─────────────────────────────────────────────
        [Theory]
        [InlineData(1952, 164)]
        [InlineData(1953, 165)]
        [InlineData(1955, 166)]
        [InlineData(1957, 167)]
        [InlineData(1959, 168)]
        [InlineData(1961, 169)]
        [InlineData(1963, 170)]
        [InlineData(1980, 170)]
        public void GetTrimestresRequis_ReturnsCorrectValue(int annee, int expected)
        {
            var svc = CreateService();
            Assert.Equal(expected, svc.GetTrimestresRequis(annee));
        }

        // ── GetAgeLegal ─────────────────────────────────────────────────────
        [Theory]
        [InlineData(1950, 62)]
        [InlineData(1960, 63)]
        [InlineData(1963, 64)]
        [InlineData(1975, 64)]
        public void GetAgeLegal_ReturnsCorrectValue(int annee, int expected)
        {
            var svc = CreateService();
            Assert.Equal(expected, svc.GetAgeLegal(annee));
        }

        // ── ComputeDecote ───────────────────────────────────────────────────
        [Fact]
        public void ComputeDecote_PleinTrimestres_Zero()
        {
            var svc = CreateService();
            Assert.Equal(0m, svc.ComputeDecote(170, 170));
        }

        [Fact]
        public void ComputeDecote_20Missing_Is25Pct()
        {
            var svc = CreateService();
            // 20 × 1.25% = 25%
            Assert.Equal(0.25m, svc.ComputeDecote(150, 170));
        }

        [Fact]
        public void ComputeDecote_NeverExceeds25Pct()
        {
            var svc = CreateService();
            // 40 missing × 1.25% = 50% but should be capped at 25%
            Assert.Equal(0.25m, svc.ComputeDecote(100, 170));
        }

        // ── ComputeSurcote ──────────────────────────────────────────────────
        [Fact]
        public void ComputeSurcote_NoExtra_Zero()
        {
            var svc = CreateService();
            Assert.Equal(0m, svc.ComputeSurcote(170, 170));
        }

        [Fact]
        public void ComputeSurcote_4Extra_Is5Pct()
        {
            var svc = CreateService();
            // 4 × 1.25% = 5%
            Assert.Equal(0.05m, svc.ComputeSurcote(174, 170));
        }

        // ── Simulate — taux plein ───────────────────────────────────────────
        [Fact]
        public async Task Simulate_TauxPlein_PensionBaseCorrect()
        {
            var svc = CreateService();
            var req = new RetirementRequestDto
            {
                AnneeNaissance = 1963,
                AgeDepart = 64,
                SalaireAnnuelMoyen = 40_000m,
                TrimestresValides = 170,
                TrimestresRequis = 170,
                PointsComplementaires = 0m
            };
            var result = await svc.Simulate(req);
            // PensionBase = 40000 × 0.50 × 1 × 1 × 1 = 20000
            Assert.Equal(20_000m, result.PensionBaseAnnuelle);
            Assert.Equal(0m, result.DecotePct);
            Assert.Equal(0m, result.SurcotePct);
            Assert.Equal(0, result.TrimestresManquants);
        }

        [Fact]
        public async Task Simulate_WithPoints_ComplementaireCorrect()
        {
            var svc = CreateService();
            var req = new RetirementRequestDto
            {
                AnneeNaissance = 1963,
                SalaireAnnuelMoyen = 40_000m,
                TrimestresValides = 170,
                TrimestresRequis = 170,
                PointsComplementaires = 8_000m
            };
            var result = await svc.Simulate(req);
            // 8000 × 1.45 = 11600
            Assert.Equal(11_600m, result.PensionComplementaireAnnuelle);
            // Brute = 20000 + 11600 = 31600
            Assert.Equal(31_600m, result.PensionBruteTotaleAnnuelle);
        }

        [Fact]
        public async Task Simulate_NetRetenueSociale_CorrectDeduction()
        {
            var svc = CreateService();
            var req = new RetirementRequestDto
            {
                AnneeNaissance = 1963,
                SalaireAnnuelMoyen = 40_000m,
                TrimestresValides = 170,
                TrimestresRequis = 170,
                PointsComplementaires = 8_000m
            };
            var result = await svc.Simulate(req);
            // PensionNette = 31600 × (1 - 0.091) = 31600 × 0.909 = 28724.40
            Assert.Equal(28_724.40m, result.PensionNetteAnnuelle);
            Assert.Equal(decimal.Round(28_724.40m / 12m, 2), result.PensionNetteMensuelle);
        }

        [Fact]
        public async Task Simulate_WithDecote_ReducesPension()
        {
            var svc = CreateService();
            var req = new RetirementRequestDto
            {
                AnneeNaissance = 1963,
                SalaireAnnuelMoyen = 40_000m,
                TrimestresValides = 150,  // 20 missing → 25% décote
                TrimestresRequis = 170,
                PointsComplementaires = 0m
            };
            var result = await svc.Simulate(req);
            // facteur = 150/170 = 0.8824..., décote = 25%
            // PensionBase = 40000 × 0.50 × (150/170) × (1-0.25) = 40000 × 0.50 × 0.8824 × 0.75 ≈ 13235.29
            Assert.Equal(25m, result.DecotePct);
            Assert.True(result.PensionBaseAnnuelle < 20_000m);
            Assert.Equal(20, result.TrimestresManquants);
        }

        [Fact]
        public async Task Simulate_WithSurcote_IncreasesPension()
        {
            var svc = CreateService();
            var req = new RetirementRequestDto
            {
                AnneeNaissance = 1963,
                SalaireAnnuelMoyen = 40_000m,
                TrimestresValides = 174,  // 4 extra → 5% surcote
                TrimestresRequis = 170,
                PointsComplementaires = 0m
            };
            var result = await svc.Simulate(req);
            Assert.Equal(5m, result.SurcotePct);
            // facteur capped at 1, surcote applies: 20000 × 1.05 = 21000
            Assert.Equal(21_000m, result.PensionBaseAnnuelle);
        }

        [Fact]
        public async Task Simulate_TauxRemplacement_Computed()
        {
            var svc = CreateService();
            var req = new RetirementRequestDto
            {
                AnneeNaissance = 1963,
                SalaireAnnuelMoyen = 40_000m,
                TrimestresValides = 170,
                TrimestresRequis = 170,
                PointsComplementaires = 8_000m,
                RevenusAnnuelsActuels = 48_000m
            };
            var result = await svc.Simulate(req);
            // pensionNetteMensuelle / (48000/12) × 100
            var expected = decimal.Round((result.PensionNetteMensuelle / (48_000m / 12m)) * 100m, 1);
            Assert.Equal(expected, result.TauxRemplacement);
        }

        [Fact]
        public async Task Simulate_ScenarioAndTauxPlein_ReferenceHigherWhenQuartersMissing()
        {
            var svc = CreateService();
            var req = new RetirementRequestDto
            {
                AnneeNaissance = 1991,
                AgeDepart = 65,
                SalaireAnnuelMoyen = 40_000m,
                TrimestresValides = 20,
                TrimestresRequis = 170,
                PointsComplementaires = 0m
            };
            var result = await svc.Simulate(req);
            Assert.Equal(2056, result.AnneeDepartRetraite);
            Assert.Equal(65, result.AgeDepart);
            Assert.Equal(64, result.AgeLegalPivot);
            Assert.True(result.PensionNetteMensuelleTauxPleinTrimestres > result.PensionNetteMensuelle);
            Assert.Equal(150, result.TrimestresManquants);
            Assert.Equal(38, result.AnneesIndicativesPourTauxPlein);
            Assert.True(result.PotentielMensuelVersTauxPlein > 0);
        }

        [Fact]
        public async Task Simulate_Objectif_ReturnsZeroExtraWhenAlreadyAbove()
        {
            var svc = CreateService();
            var req = new RetirementRequestDto
            {
                AnneeNaissance = 1963,
                SalaireAnnuelMoyen = 40_000m,
                TrimestresValides = 170,
                TrimestresRequis = 170,
                PointsComplementaires = 0m,
                ObjectifPensionMensuelleNet = 100m
            };
            var result = await svc.Simulate(req);
            Assert.True(result.ObjectifAtteignable);
            Assert.Equal(0, result.TrimestresAdditionnelsPourObjectif);
            Assert.Equal(0, result.AnneesIndicativesPourObjectif);
        }
    }
}
