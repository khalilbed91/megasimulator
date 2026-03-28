using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Services;

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
    }
}
