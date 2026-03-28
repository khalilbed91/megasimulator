using System;
using System.Collections.Generic;
using System.Threading.Tasks;
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

        [HttpGet("{id}")]
        public async Task<ActionResult<SimulationDto>> Get(Guid id)
        {
            var s = await _service.GetByIdAsync(id);
            if (s == null) return NotFound();
            return Ok(s);
        }

        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<SimulationDto>>> ListByUser(Guid userId)
        {
            var list = await _service.ListByUserAsync(userId);
            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult<SimulationDto>> Create([FromBody] SimulationDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] SimulationDto dto)
        {
            if (id != dto.Id) return BadRequest();
            await _service.UpdateAsync(dto);
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
