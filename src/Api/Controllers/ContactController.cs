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
    public class ContactController : ControllerBase
    {
        private readonly IContactService _service;

        public ContactController(IContactService service)
        {
            _service = service;
        }

        [HttpPost]
        [AllowAnonymous]
        [RequestSizeLimit(32_000)]
        [Microsoft.AspNetCore.RateLimiting.EnableRateLimiting("contact")]
        public async Task<IActionResult> Create([FromBody] ContactRequestDto req)
        {
            Guid? userId = null;
            var idStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(idStr) && Guid.TryParse(idStr, out var parsed))
                userId = parsed;

            var created = await _service.CreateAsync(req, userId);
            return Ok(created);
        }
    }
}

