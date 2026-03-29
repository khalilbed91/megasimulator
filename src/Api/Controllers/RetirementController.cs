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
    public class RetirementController : ControllerBase
    {
        private readonly IRetirementService _retirementService;

        public RetirementController(IRetirementService retirementService)
        {
            _retirementService = retirementService;
        }

        [HttpPost("simulate")]
        [AllowAnonymous]
        public async Task<IActionResult> Simulate([FromBody] RetirementRequestDto req)
        {
            Guid? userId = null;
            var idStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(idStr) && Guid.TryParse(idStr, out var parsed))
                userId = parsed;

            var response = await _retirementService.Simulate(req, userId);
            return Ok(response);
        }
    }
}
