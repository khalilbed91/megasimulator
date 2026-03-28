using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MegaSimulator.Application.Interfaces;

namespace MegaSimulator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _auth;
        private readonly Microsoft.Extensions.Logging.ILogger<AuthController> _logger;

        public AuthController(IAuthService auth, Microsoft.Extensions.Logging.ILogger<AuthController> logger)
        {
            _auth = auth;
            _logger = logger;
        }

        public record LoginRequest(string Username, string Password);

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            _logger.LogInformation("Auth login attempt for user: {username}", req.Username);
            var token = await _auth.AuthenticateAsync(req.Username, req.Password);
            if (token == null)
            {
                _logger.LogWarning("Authentication returned null for user {username}", req.Username);
                return Unauthorized();
            }
            _logger.LogInformation("Authentication succeeded for user {username}", req.Username);
            return Ok(new { token });
        }
    }
}
