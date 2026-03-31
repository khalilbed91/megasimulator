using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;

namespace MegaSimulator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SimulationController : ControllerBase
    {
        private readonly ISimulationService _service;

        public SimulationController(ISimulationService service)
        {
            _service = service;
        }

        // Returns the caller's own simulations (newest first). Storage is capped at 10 rows per user
        // in SimulationRepository; excess older rows are deleted when saving or listing.
        [HttpGet("mine")]
        [Authorize]
        public async Task<ActionResult<IEnumerable<SimulationDto>>> ListMine()
        {
            var userId = GetCallerUserId();
            if (userId == null) return Unauthorized();
            var list = await _service.ListByUserAsync(userId.Value);
            return Ok(list);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<SimulationDto>> Get(Guid id)
        {
            var s = await _service.GetByIdAsync(id);
            if (s == null) return NotFound();
            // Only the owner can read their simulation
            var callerId = GetCallerUserId();
            if (s.UserId != null && s.UserId != callerId) return Forbid();
            return Ok(s);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            var s = await _service.GetByIdAsync(id);
            if (s == null) return NotFound();
            // Only the owner can delete their simulation
            var callerId = GetCallerUserId();
            if (s.UserId != null && s.UserId != callerId) return Forbid();
            await _service.DeleteAsync(id);
            return NoContent();
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<SimulationDto>> Create([FromBody] SimulationDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(Guid id, [FromBody] SimulationDto dto)
        {
            if (id != dto.Id) return BadRequest();
            var existing = await _service.GetByIdAsync(id);
            if (existing == null) return NotFound();
            var callerId = GetCallerUserId();
            if (existing.UserId != null && existing.UserId != callerId) return Forbid();
            await _service.UpdateAsync(dto);
            return NoContent();
        }

        // Admin-only: list by explicit userId
        [HttpGet("user/{userId}")]
        [Authorize(Roles = "admin")]
        public async Task<ActionResult<IEnumerable<SimulationDto>>> ListByUser(Guid userId)
        {
            var list = await _service.ListByUserAsync(userId);
            return Ok(list);
        }

        private Guid? GetCallerUserId()
        {
            var idStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(idStr, out var id) ? id : null;
        }
    }
}
