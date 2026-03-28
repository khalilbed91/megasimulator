using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;

namespace MegaSimulator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> Get(Guid id)
        {
            var u = await _service.GetByIdAsync(id);
            if (u == null) return NotFound();
            return Ok(u);
        }

        [HttpGet("username/{username}")]
        public async Task<ActionResult<UserDto>> GetByUsername(string username)
        {
            var u = await _service.GetByUsernameAsync(username);
            if (u == null) return NotFound();
            return Ok(u);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> Create([FromBody] UserDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UserDto dto)
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
