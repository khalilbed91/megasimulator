using System.Threading.Tasks;
using MegaSimulator.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace MegaSimulator.Api.Controllers
{
    [ApiController]
    [Route("api/reference")]
    public class ReferenceController : ControllerBase
    {
        private readonly IPostalCodeService _postalCodeService;

        public ReferenceController(IPostalCodeService postalCodeService)
        {
            _postalCodeService = postalCodeService;
        }

        [HttpGet("postal-codes")]
        public async Task<IActionResult> SearchPostalCodes([FromQuery] string q = "", [FromQuery] int limit = 12)
        {
            var results = await _postalCodeService.SearchAsync(q, limit);
            return Ok(results);
        }
    }
}
