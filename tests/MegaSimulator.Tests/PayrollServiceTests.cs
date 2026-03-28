using System.Threading.Tasks;
using MegaSimulator.Application.Params;
using MegaSimulator.Application.Services;
using Moq;
using Xunit;

namespace MegaSimulator.Tests
{
    public class PayrollServiceTests
    {
        [Fact]
        public async Task BrutToNet_FallbackNonCadre_3000()
        {
            var mockFormula = new Mock<MegaSimulator.Application.Interfaces.IFormulaService>();
            mockFormula.Setup(f => f.GetByNameAsync("brut_to_net_estimate")).ReturnsAsync((MegaSimulator.Domain.Entities.Formula?)null);
            var ps = new PayrollService(mockFormula.Object, new PayrollParams());
            var net = await ps.BrutToNet(3000m);
            Assert.Equal(2349.0m, net);
        }

        [Fact]
        public async Task EmployerCost_Fallback_3000()
        {
            var mockFormula = new Mock<MegaSimulator.Application.Interfaces.IFormulaService>();
            mockFormula.Setup(f => f.GetByNameAsync("employer_cost_estimate")).ReturnsAsync((MegaSimulator.Domain.Entities.Formula?)null);
            var ps = new PayrollService(mockFormula.Object, new PayrollParams());
            var cost = await ps.EmployerCost(3000m);
            Assert.Equal(4350.0m, cost);
        }

        [Fact]
        public async Task ComputeCDDPrime_Default()
        {
            var mockFormula = new Mock<MegaSimulator.Application.Interfaces.IFormulaService>();
            var ps = new PayrollService(mockFormula.Object, new PayrollParams());
            var prime = await ps.ComputeCDDPrime(1000m);
            Assert.Equal(100m, prime);
        }

        [Fact]
        public void ComputeCsgComponents_UsesParams()
        {
            var mockFormula = new Mock<MegaSimulator.Application.Interfaces.IFormulaService>();
            var p = new PayrollParams
            {
                CsgCrds = new CsgCrds { assiette_pct = 98.25, csg_deductible_pct = 0.068, csg_non_deductible_pct = 0.029 }
            };
            var ps = new PayrollService(mockFormula.Object, p);
            var (baseCsg, ded, nonDed) = ps.ComputeCsgComponents(3000m);
            Assert.Equal(2947.5m, baseCsg);
            Assert.Equal(decimal.Round(2947.5m * 0.068m, 6), decimal.Round(ded, 6));
            Assert.Equal(decimal.Round(2947.5m * 0.029m, 6), decimal.Round(nonDed, 6));
        }

        [Fact]
        public void ComputeAgircArrcoContribution_3000()
        {
            var mockFormula = new Mock<MegaSimulator.Application.Interfaces.IFormulaService>();
            var p = new PayrollParams { AgircArrco = new AgircArrco { tranche1_pct = 0.0787, tranche2_pct = 0.2159 }, Pmss = new Pmss { monthly = 4005, annual = 48060 } };
            var ps = new PayrollService(mockFormula.Object, p);
            var contrib = ps.ComputeAgircArrcoContribution(3000m);
            Assert.Equal(236.1m, decimal.Round(contrib, 4));
        }

        [Fact]
        public void IsJeiEligible_3000_ReturnsTrue()
        {
            var mockFormula = new Mock<MegaSimulator.Application.Interfaces.IFormulaService>();
            var p = new PayrollParams { Pmss = new Pmss { monthly = 4005, annual = 48060 }, Jei = null };
            var ps = new PayrollService(mockFormula.Object, p);
            Assert.True(ps.IsJeiEligible(3000m));
        }

        [Fact]
        public void FreelanceCaToNet_Services_1000()
        {
            var mockFormula = new Mock<MegaSimulator.Application.Interfaces.IFormulaService>();
            var ps = new PayrollService(mockFormula.Object, new PayrollParams());
            var net = ps.FreelanceCaToNet(1000m, "services");
            Assert.Equal(760m, net);
        }
    }
}

