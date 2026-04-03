using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Services;
using Xunit;

namespace MegaSimulator.Tests
{
    public class LoanServiceTests
    {
        private static LoanService Svc() => new LoanService();

        [Fact]
        public void MonthlyAnnuity_KnownVector_100k_5pct_240m()
        {
            var s = Svc();
            var m = s.MonthlyAnnuity(100_000m, 5m, 240);
            Assert.InRange(m, 659.9m, 660.1m);
        }

        [Fact]
        public async Task Simulate_Perso_SimplePrincipal()
        {
            var r = await Svc().Simulate(new LoanRequestDto
            {
                Category = "perso",
                Amount = 10_000m,
                DownPayment = 0m,
                NominalRateAnnualPercent = 5m,
                DurationMonths = 48,
                InsuranceAnnualPercent = 0m
            });
            Assert.Equal("perso", r.Category);
            Assert.Equal(10_000m, r.BankPrincipal);
            Assert.True(r.MonthlyBankPrincipalInterest > 0);
        }

        [Fact]
        public async Task Simulate_Immo_NotaryAndBankK()
        {
            var r = await Svc().Simulate(new LoanRequestDto
            {
                Category = "immo",
                TvaRegime = "ancien",
                PurchasePriceTtc = 200_000m,
                DownPayment = 40_000m,
                NominalRateAnnualPercent = 3.5m,
                DurationMonths = 240,
                IncludePtz = false,
                IncludeActionLogement = false
            });
            Assert.Equal(200_000m, r.EffectivePurchaseTtc);
            Assert.Equal(15_000m, r.NotaryFees);
            Assert.Equal(175_000m, r.BankPrincipal);
        }

        [Fact]
        public async Task Simulate_Immo_Ptz_CappedByIncome()
        {
            var r = await Svc().Simulate(new LoanRequestDto
            {
                Category = "immo",
                TvaRegime = "neuf20",
                PurchasePriceTtc = 300_000m,
                DownPayment = 30_000m,
                NominalRateAnnualPercent = 3.4m,
                DurationMonths = 300,
                IncludePtz = true,
                PtzZone = "B1",
                HouseholdPersons = 2,
                FiscalReferenceIncome = 200_000m,
                PtzAmount = 80_000m,
                PtzDefermentMonths = 120
            });
            Assert.False(r.PtzIncomeEligible);
            Assert.Equal(0m, r.PtzAmountApplied);
            Assert.Contains(r.Warnings, w => w.Contains("PTZ"));
        }

        [Fact]
        public async Task Simulate_ActionLogement_ReducesBankK()
        {
            var r = await Svc().Simulate(new LoanRequestDto
            {
                Category = "immo",
                PurchasePriceTtc = 250_000m,
                DownPayment = 25_000m,
                NominalRateAnnualPercent = 3.2m,
                DurationMonths = 240,
                IncludePtz = false,
                IncludeActionLogement = true,
                ActionLogementAmount = 30_000m,
                ActionLogementRateAnnualPercent = 1m
            });
            Assert.Equal(30_000m, r.ActionLogementAmountApplied);
            Assert.True(r.MonthlyActionLogement > 0);
        }

        [Fact]
        public async Task Simulate_UsuryThreshold_MatchesBanqueDeFrance_April2026()
        {
            var immo20 = await Svc().Simulate(new LoanRequestDto
            {
                Category = "immo",
                PurchasePriceTtc = 200_000m,
                DownPayment = 40_000m,
                NominalRateAnnualPercent = 3m,
                DurationMonths = 240,
                TvaRegime = "ancien"
            });
            Assert.Equal(5.19m, immo20.UsuryThresholdPercent);

            var immo15 = await Svc().Simulate(new LoanRequestDto
            {
                Category = "immo",
                PurchasePriceTtc = 200_000m,
                DownPayment = 40_000m,
                NominalRateAnnualPercent = 3m,
                DurationMonths = 180,
                TvaRegime = "ancien"
            });
            Assert.Equal(4.48m, immo15.UsuryThresholdPercent);

            var perso = await Svc().Simulate(new LoanRequestDto
            {
                Category = "perso",
                Amount = 10_000m,
                NominalRateAnnualPercent = 5m,
                DurationMonths = 48
            });
            Assert.Equal(8.61m, perso.UsuryThresholdPercent);
        }

        [Fact]
        public async Task Simulate_Immo_BoosterZeroPercent_SplitsPrincipalAndLowersInterest()
        {
            var plain = await Svc().Simulate(new LoanRequestDto
            {
                Category = "immo",
                TvaRegime = "ancien",
                PurchasePriceTtc = 200_000m,
                DownPayment = 40_000m,
                NominalRateAnnualPercent = 3.5m,
                DurationMonths = 240,
                InsuranceAnnualPercent = 0m,
                BoosterAmount = 0m
            });
            var withBooster = await Svc().Simulate(new LoanRequestDto
            {
                Category = "immo",
                TvaRegime = "ancien",
                PurchasePriceTtc = 200_000m,
                DownPayment = 40_000m,
                NominalRateAnnualPercent = 3.5m,
                DurationMonths = 240,
                InsuranceAnnualPercent = 0m,
                BoosterAmount = 30_000m
            });
            Assert.Equal(175_000m, plain.BankPrincipal);
            Assert.Equal(175_000m, withBooster.BankPrincipal);
            Assert.Equal(30_000m, withBooster.BoosterAmountApplied);
            Assert.Equal(145_000m, withBooster.MainBankPrincipal);
            Assert.True(withBooster.MonthlyBankPrincipalInterest < plain.MonthlyBankPrincipalInterest);
            Assert.True(withBooster.TotalInterestBank < plain.TotalInterestBank);
        }
    }
}
