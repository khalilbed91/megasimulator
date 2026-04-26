using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Services;
using Xunit;

namespace MegaSimulator.Tests
{
    public class InsuranceServiceTests
    {
        private static InsuranceService Svc() => new InsuranceService();

        [Fact]
        public void UpdateCrm_AppliesBonusAndBounds()
        {
            var svc = Svc();

            Assert.Equal(0.95m, svc.UpdateCrm(1m, 0, 0));
            Assert.Equal(1.25m, svc.UpdateCrm(1m, 1, 0));
            Assert.Equal(1.125m, svc.UpdateCrm(1m, 0, 1));
            Assert.Equal(0.50m, svc.UpdateCrm(0.50m, 0, 0));
            Assert.Equal(3.50m, svc.UpdateCrm(3.50m, 1, 0));
        }

        [Fact]
        public async Task Simulate_HomeTenant_UsesMandatoryRentalRisk()
        {
            var r = await Svc().Simulate(new InsuranceRequestDto
            {
                Product = "home",
                CoverageLevel = "legal_minimum",
                DeductibleLevel = "medium",
                ZoneFactor = 1m,
                Home = new HomeInsuranceInputDto
                {
                    OccupantStatus = "tenant",
                    HousingType = "apartment",
                    SurfaceSqm = 50m,
                    ContentsValue = 10_000m
                }
            });

            Assert.True(r.IsMandatoryInsurance);
            Assert.Contains("risques locatifs", r.MandatoryCoverageLabel);
            Assert.True(r.MonthlyPremium > 0);
        }

        [Fact]
        public async Task Simulate_Auto_UsesCrmAndMandatoryRc()
        {
            var r = await Svc().Simulate(new InsuranceRequestDto
            {
                Product = "auto",
                CoverageLevel = "third_party",
                Vehicle = new VehicleInsuranceInputDto
                {
                    VehicleValue = 12_000m,
                    DriverAge = 40,
                    LicenseYears = 15,
                    Crm = 0.8m
                }
            });

            Assert.True(r.IsMandatoryInsurance);
            Assert.Equal(0.8m, r.CrmUsed);
            Assert.True(r.AnnualPremium > 0);
        }

        [Fact]
        public async Task Simulate_Moto_OverdueTechnicalInspectionWarns()
        {
            var r = await Svc().Simulate(new InsuranceRequestDto
            {
                Product = "moto",
                CoverageLevel = "theft_fire",
                Vehicle = new VehicleInsuranceInputDto
                {
                    Category = "motorcycle",
                    EngineCc = 650,
                    TechnicalInspectionStatus = "overdue",
                    VehicleValue = 8_000m,
                    Crm = 1m
                }
            });

            Assert.Contains(r.Warnings, w => w.Contains("Contrôle technique"));
            Assert.True(r.MonthlyPremium > 0);
        }
    }
}
