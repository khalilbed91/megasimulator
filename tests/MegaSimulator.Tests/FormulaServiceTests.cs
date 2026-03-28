using System.Collections.Generic;
using System.Threading.Tasks;
using Moq;
using Xunit;
using MegaSimulator.Application.Services;
using MegaSimulator.Domain.Interfaces;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Tests
{
    public class FormulaServiceTests
    {
        [Fact]
        public async Task EvaluateAsync_ComputesExpression()
        {
            var mockRepo = new Mock<IFormulaRepository>();
            var svc = new FormulaService(mockRepo.Object);

            var res = await svc.EvaluateAsync("Brut - (Brut * 0.217)", new Dictionary<string, object?> { { "Brut", 3000.0 } });

            Assert.NotNull(res);
            var d = System.Convert.ToDouble(res);
            Assert.Equal(2349.0, d, 3);
        }
    }
}
