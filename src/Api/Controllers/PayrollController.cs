using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Services;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;
using System.Text.Json;

namespace MegaSimulator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PayrollController : ControllerBase
    {
        private readonly PayrollService _payrollService;

        public PayrollController(PayrollService payrollService)
        {
            _payrollService = payrollService;
        }

        [HttpPost("brut-to-net")]
        public async Task<IActionResult> BrutToNet([FromBody] PayrollRequestDto req)
        {
            var net = await _payrollService.BrutToNet(req.Brut, req.Statut ?? "non-cadre");
            return Ok(new { net });
        }

        [HttpPost("simulate")]
        public async Task<IActionResult> Simulate([FromBody] PayrollRequestDto req)
        {
            Guid? userId = null;
            var idStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(idStr) && Guid.TryParse(idStr, out var parsed))
                userId = parsed;

            var response = await _payrollService.Simulate(req, userId);
            return Ok(response);
        }
    }
}
