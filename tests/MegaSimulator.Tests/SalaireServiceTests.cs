using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MegaSimulator.Application.Services;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Domain.Interfaces;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Tests
{
    public class SalaireServiceTests
    {
        [Fact]
        public async Task CreateAsync_CreatesAndReturnsDto()
        {
            var mockRepo = new Mock<ISalaireRepository>();
            mockRepo.Setup(r => r.AddAsync(It.IsAny<Salaire>())).Returns(Task.CompletedTask)
                .Verifiable();

            var service = new SalaireService(mockRepo.Object, Mock.Of<System.IServiceProvider>(), null);

            var dto = new SalaireDto(Guid.Empty, Guid.NewGuid(), 1000m, 100m, DateTime.UtcNow);
            var result = await service.CreateAsync(dto);

            Assert.NotEqual(Guid.Empty, result.Id);
            Assert.Equal(dto.EmployeeId, result.EmployeeId);
            mockRepo.Verify(r => r.AddAsync(It.IsAny<Salaire>()), Times.Once);
        }

        [Fact]
        public async Task ListByEmployeeAsync_ReturnsMappedDtos()
        {
            var employeeId = Guid.NewGuid();
            var sample = new List<Salaire>
            {
                new Salaire { Id = Guid.NewGuid(), EmployeeId = employeeId, BaseSalary = 1000, Bonuses = 0, EffectiveDate = DateTime.UtcNow }
            };

            var mockRepo = new Mock<ISalaireRepository>();
            mockRepo.Setup(r => r.ListByEmployeeAsync(employeeId)).ReturnsAsync(sample);

            var service = new SalaireService(mockRepo.Object, Mock.Of<System.IServiceProvider>(), null);

            var list = await service.ListByEmployeeAsync(employeeId);
            Assert.Single(list);
        }
    }
}
