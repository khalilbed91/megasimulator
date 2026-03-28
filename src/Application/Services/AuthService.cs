using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Interfaces;

namespace MegaSimulator.Application.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepo;
        private readonly IConfiguration _config;
        private readonly Microsoft.Extensions.Logging.ILogger<AuthService> _logger;

        public AuthService(IUserRepository userRepo, IConfiguration config, Microsoft.Extensions.Logging.ILogger<AuthService> logger)
        {
            _userRepo = userRepo;
            _config = config;
            _logger = logger;
        }

        public async Task<string?> AuthenticateAsync(string username, string password)
        {
            var user = await _userRepo.GetByUsernameAsync(username);
            if (user == null)
            {
                _logger.LogWarning("Authentication failed: user not found: {username}", username);
                return null;
            }

            if (string.IsNullOrEmpty(user.PasswordHash))
            {
                _logger.LogWarning("Authentication failed: user has no password hash: {username}", username);
                return null;
            }

            var ok = false;
            try
            {
                ok = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "BCrypt verification error for user {username}", username);
                return null;
            }

            if (!ok)
            {
                _logger.LogWarning("Authentication failed: invalid password for {username}", username);
                return null;
            }

            var key = _config["JWT:Key"] ?? Environment.GetEnvironmentVariable("JWT__KEY");
            var issuer = _config["JWT:Issuer"] ?? Environment.GetEnvironmentVariable("JWT__ISSUER") ?? "megasimulator";
            if (string.IsNullOrEmpty(key)) return null;

            var tokenHandler = new JwtSecurityTokenHandler();
            var tokenKey = Encoding.ASCII.GetBytes(key);
            // Ensure key length is sufficient for HMAC-SHA256 (>= 256 bits). If not, derive a 256-bit key from the provided secret.
            if (tokenKey.Length < 32)
            {
                using var sha = System.Security.Cryptography.SHA256.Create();
                tokenKey = sha.ComputeHash(Encoding.UTF8.GetBytes(key));
            }
            var claims = new[] {
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddHours(8),
                Issuer = issuer,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(tokenKey), SecurityAlgorithms.HmacSha256Signature)
            };

            // add role claims
            if (user.Roles != null)
            {
                foreach (var r in user.Roles)
                {
                    tokenDescriptor.Subject.AddClaim(new Claim(ClaimTypes.Role, r));
                }
            }

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}
