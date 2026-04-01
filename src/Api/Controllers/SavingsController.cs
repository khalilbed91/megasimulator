using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;

namespace MegaSimulator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SavingsController : ControllerBase
    {
        private readonly ISavingsService _savingsService;

        public SavingsController(ISavingsService savingsService)
        {
            _savingsService = savingsService;
        }

        [HttpPost("simulate")]
        [AllowAnonymous]
        [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("simulate")]
        public async Task<IActionResult> Simulate([FromBody] SavingsRequestDto req)
        {
            Guid? userId = null;
            var idStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(idStr) && Guid.TryParse(idStr, out var parsed))
                userId = parsed;

            var response = await _savingsService.Simulate(req, userId);
            return Ok(response);
        }
    }
}
