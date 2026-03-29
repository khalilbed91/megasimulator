using System.Threading.Tasks;
using MegaSimulator.Application.Params;
using MegaSimulator.Application.Services;
using Moq;
using Xunit;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Domain.Interfaces;

namespace MegaSimulator.Tests
{
    public class PayrollSimulationTests
    {
        [Fact]
        public async Task Simulate_PersistsSimulationAndReturnsResponse()
        {
            var mockFormula = new Mock<MegaSimulator.Application.Interfaces.IFormulaService>();
            mockFormula.Setup(f => f.GetByNameAsync("brut_to_net_estimate")).ReturnsAsync((MegaSimulator.Domain.Entities.Formula?)null);

            var mockRepo = new Mock<ISimulationRepository>();
            mockRepo.Setup(r => r.AddAsync(It.IsAny<MegaSimulator.Domain.Entities.Simulation>())).Returns(Task.CompletedTask).Verifiable();

            var ps = new PayrollService(mockFormula.Object, new PayrollParams(), mockRepo.Object);

            var req = new PayrollRequestDto { Brut = 3000m, Statut = "non-cadre" };
            var resp = await ps.Simulate(req);

            Assert.NotNull(resp);
            Assert.Equal(2349.0m, resp.Net);
            Assert.True(resp.EmployerCost > 0);

            mockRepo.Verify(r => r.AddAsync(It.IsAny<MegaSimulator.Domain.Entities.Simulation>()), Times.Once);
        }
    }
}
