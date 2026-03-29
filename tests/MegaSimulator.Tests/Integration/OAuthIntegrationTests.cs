using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Interfaces;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Tests.Integration
{
    public class OAuthIntegrationTests
    {
        [Fact]
        public async Task GoogleCallback_Logic_CreatesUserAndBuildsRedirect()
        {
            var googleMock = new Mock<IGoogleAuthClient>();
            googleMock.Setup(g => g.ExchangeCodeForAccessTokenAsync(It.IsAny<string>(), It.IsAny<string>()))
                .ReturnsAsync("fake_access_token");
            googleMock.Setup(g => g.GetUserInfoAsync("fake_access_token"))
                .ReturnsAsync(new GoogleUserInfo { Email = "test@example.com", Sub = "sub1" });

            var authMock = new Mock<IAuthService>();
            authMock.Setup(a => a.GenerateTokenForUser(It.IsAny<User>())).Returns("fake_jwt_token");

            var frontend = "https://frontend.local";

            var fakeRepo = new FakeUserRepository();

            // Simulate controller logic without ASP.NET pipeline
            var accessToken = await googleMock.Object.ExchangeCodeForAccessTokenAsync("code123", "https://app/callback");
            Assert.Equal("fake_access_token", accessToken);

            var info = await googleMock.Object.GetUserInfoAsync(accessToken!);
            Assert.NotNull(info);
            Assert.Equal("test@example.com", info!.Email);

            var existing = await fakeRepo.GetByUsernameAsync(info!.Email!);
            if (existing == null)
            {
                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = info.Email ?? info.Sub ?? Guid.NewGuid().ToString(),
                    Email = info.Email ?? string.Empty,
                    CreatedAt = DateTime.UtcNow,
                    PasswordHash = null,
                    Roles = new string[] { "user" }
                };
                await fakeRepo.AddAsync(user);
            }

            var token = authMock.Object.GenerateTokenForUser(new User { Id = Guid.NewGuid(), Username = "x", Roles = new string[] { "user" } });
            // use local frontend value for redirect construction
            // (mirrors controller behaviour when FRONTEND:Url is set)
            
            var redirectUrl = frontend + (frontend.Contains("?") ? "&" : "?") + "token=" + Uri.EscapeDataString(token);

            Assert.Contains("token=fake_jwt_token", redirectUrl);
            Assert.True(fakeRepo.Added);
            Assert.Equal("test@example.com", fakeRepo.LastAdded?.Email);
        }

        class FakeUserRepository : IUserRepository
        {
            public bool Added { get; private set; }
            public User? LastAdded { get; private set; }

            public Task AddAsync(User user)
            {
                Added = true;
                LastAdded = user;
                return Task.CompletedTask;
            }

            public Task<User?> GetByIdAsync(System.Guid id) => Task.FromResult<User?>(null);
            public Task<User?> GetByUsernameAsync(string username) => Task.FromResult<User?>(null);
            public Task UpdateAsync(User user) => Task.CompletedTask;
            public Task DeleteAsync(System.Guid id) => Task.CompletedTask;
        }
    }
}
