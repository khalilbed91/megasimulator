using System;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MegaSimulator.Application.Services;
using MegaSimulator.Domain.Interfaces;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Tests
{
    public class SimulationServiceTests
    {
        [Fact]
        public async Task CreateAsync_PayrollSimulation_AttachesResultsAndPersists()
        {
            var mockRepo = new Mock<ISimulationRepository>();
            mockRepo.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.Simulation>())).Returns(Task.CompletedTask).Verifiable();

            var mockResultRepo = new Mock<ISimulationResultRepository>();
            mockResultRepo.Setup(r => r.AddAsync(It.IsAny<Domain.Entities.SimulationResult>())).Returns(Task.CompletedTask).Verifiable();

            var mockPayroll = new Mock<PayrollService>(null!, null!);
            mockPayroll.Setup(p => p.BrutToNet(It.IsAny<decimal>(), It.IsAny<string>())).ReturnsAsync(2350m);
            mockPayroll.Setup(p => p.EmployerCost(It.IsAny<decimal>())).ReturnsAsync(4350m);
            mockPayroll.Setup(p => p.ComputeCDDPrime(It.IsAny<decimal>())).ReturnsAsync(100m);

            var svc = new SimulationService(mockRepo.Object, mockPayroll.Object, mockResultRepo.Object);

            var payload = "{ \"Brut\": 3000, \"TotalBruts\": 1000, \"Statut\": \"non-cadre\" }";
            var dto = new SimulationDto(Guid.Empty, Guid.NewGuid(), "Payroll run", "payroll", payload, true, null, DateTime.UtcNow, null);

            var created = await svc.CreateAsync(dto);

            Assert.NotNull(created);
            mockRepo.Verify(r => r.AddAsync(It.IsAny<Domain.Entities.Simulation>()), Times.Once);
            mockResultRepo.Verify(r => r.AddAsync(It.IsAny<Domain.Entities.SimulationResult>()), Times.Once);
        }
    }
}
