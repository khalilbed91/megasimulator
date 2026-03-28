using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MegaSimulator.Application.Services;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Application.Params;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Tests
{
    public class PayrollServiceTests
    {
        [Fact]
        public async Task BrutToNet_UsesFormulaWhenAvailable()
        {
            var mockFormula = new Mock<IFormulaService>();
            mockFormula.Setup(f => f.GetByNameAsync("brut_to_net_estimate")).ReturnsAsync(new Formula { Expression = "Brut - (Brut * 0.217)" });
            mockFormula.Setup(f => f.EvaluateAsync(It.IsAny<string>(), It.IsAny<IDictionary<string, object?>>()))
                .ReturnsAsync(2349.0);

            var ps = new PayrollService(mockFormula.Object, new PayrollParams());
            var net = await ps.BrutToNet(3000m);

            Assert.Equal(2349.0m, net);
        }

        [Fact]
        public async Task BrutToNet_FallbackWhenNoFormula()
        {
            var mockFormula = new Mock<IFormulaService>();
            mockFormula.Setup(f => f.GetByNameAsync("brut_to_net_estimate")).ReturnsAsync((Formula?)null);

            var ps = new PayrollService(mockFormula.Object, new PayrollParams());
            var net = await ps.BrutToNet(3000m, "non-cadre");

            Assert.Equal(3000m - (3000m * 0.217m), net);
        }
    }
}
