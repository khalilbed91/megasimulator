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
        private readonly MegaSimulator.Application.Interfaces.IGoogleAuthClient _googleClient;
        private readonly Microsoft.Extensions.Configuration.IConfiguration _config;
        private readonly MegaSimulator.Application.Interfaces.IUserService _userService;

        public AuthController(IAuthService auth, Microsoft.Extensions.Logging.ILogger<AuthController> logger, MegaSimulator.Application.Interfaces.IGoogleAuthClient googleClient, Microsoft.Extensions.Configuration.IConfiguration config, MegaSimulator.Application.Interfaces.IUserService userService)
        {
            _auth = auth;
            _logger = logger;
            _googleClient = googleClient;
            _config = config;
            _userService = userService;
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

        [HttpGet("google")]
        public IActionResult Google()
        {
            var clientId = _config["GOOGLE:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE__CLIENTID");
            var redirect = _config["GOOGLE:RedirectUri"] ?? Environment.GetEnvironmentVariable("GOOGLE__REDIRECT") ?? ($"{Request.Scheme}://{Request.Host}/api/auth/google/callback");
            var state = System.Guid.NewGuid().ToString();
            var url = $"https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id={Uri.EscapeDataString(clientId ?? string.Empty)}&scope={Uri.EscapeDataString("openid email profile")}&redirect_uri={Uri.EscapeDataString(redirect)}&state={state}&access_type=offline&prompt=consent";
            return Redirect(url);
        }

        [HttpGet("google/callback")]
        public async Task<IActionResult> GoogleCallback([FromQuery] string code, [FromQuery] string? state)
        {
            var redirect = _config["GOOGLE:RedirectUri"] ?? Environment.GetEnvironmentVariable("GOOGLE__REDIRECT") ?? ($"{Request.Scheme}://{Request.Host}/api/auth/google/callback");
            var accessToken = await _googleClient.ExchangeCodeForAccessTokenAsync(code, redirect);
            if (accessToken == null) return BadRequest("Failed to exchange code");
            var info = await _googleClient.GetUserInfoAsync(accessToken);
            if (info == null || string.IsNullOrEmpty(info.Email)) return BadRequest("Failed to fetch user info");

            // find or create user
            var userRepo = HttpContext.RequestServices.GetService(typeof(MegaSimulator.Domain.Interfaces.IUserRepository)) as MegaSimulator.Domain.Interfaces.IUserRepository;
            MegaSimulator.Domain.Entities.User? user = null;
            if (userRepo != null)
            {
                user = await userRepo.GetByUsernameAsync(info.Email!);
                if (user == null)
                {
                    user = new MegaSimulator.Domain.Entities.User
                    {
                        Id = Guid.NewGuid(),
                        Username = info.Email ?? info.Sub ?? Guid.NewGuid().ToString(),
                        Email = info.Email ?? string.Empty,
                        CreatedAt = DateTime.UtcNow,
                        PasswordHash = null,
                        Roles = new string[] { "user" }
                    };
                    try { await userRepo.AddAsync(user); } catch { }
                }
            }

            var token = user != null ? _auth.GenerateTokenForUser(user) : string.Empty;

            var frontend = _config["FRONTEND:Url"] ?? Environment.GetEnvironmentVariable("FRONTEND__URL") ?? "/";
            var redirectUrl = string.IsNullOrEmpty(token) ? frontend : (frontend + (frontend.Contains("?") ? "&" : "?") + "token=" + Uri.EscapeDataString(token));
            return Redirect(redirectUrl);
        }

        [HttpGet("me")]
        [Microsoft.AspNetCore.Authorization.Authorize]
        public async Task<IActionResult> Me()
        {
            var idStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(idStr)) return Unauthorized();
            if (!System.Guid.TryParse(idStr, out var id)) return Unauthorized();
            var u = await _userService.GetByIdAsync(id);
            if (u == null) return NotFound();
            return Ok(u);
        }
    }
}
