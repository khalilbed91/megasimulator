using System;
using MegaSimulator.Application.Services;
using MegaSimulator.Domain.Entities;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;

namespace MegaSimulator.Tests
{
    public class AuthServiceTests
    {
        [Fact]
        public void GenerateTokenForUser_ReturnsToken()
        {
            Environment.SetEnvironmentVariable("JWT__KEY", "super-secret-key-that-is-long-enough-to-be-used-for-tests");
            var mockUserRepo = new Mock<MegaSimulator.Domain.Interfaces.IUserRepository>();
            var mockLogger = new Mock<Microsoft.Extensions.Logging.ILogger<AuthService>>();
            var mockConfig = new Mock<Microsoft.Extensions.Configuration.IConfiguration>();
            mockConfig.Setup(c => c[It.IsAny<string>()]).Returns((string?)null);
            var svc = new AuthService(mockUserRepo.Object, mockConfig.Object, mockLogger.Object);

            var user = new User { Id = Guid.NewGuid(), Username = "u1", Email = "u1@example.com", CreatedAt = DateTime.UtcNow };
            var token = svc.GenerateTokenForUser(user);
            Assert.False(string.IsNullOrEmpty(token));
        }
    }
}
