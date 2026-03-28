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
    public class SalaireController : ControllerBase
    {
        private readonly ISalaireService _service;

        public SalaireController(ISalaireService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SalaireDto>> Get(Guid id)
        {
            var s = await _service.GetByIdAsync(id);
            if (s == null) return NotFound();
            return Ok(s);
        }

        [HttpGet("employee/{employeeId}")]
        public async Task<ActionResult<IEnumerable<SalaireDto>>> ListByEmployee(Guid employeeId)
        {
            var list = await _service.ListByEmployeeAsync(employeeId);
            return Ok(list);
        }

        [HttpPost]
        public async Task<ActionResult<SalaireDto>> Create([FromBody] SalaireDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }
    }
}
