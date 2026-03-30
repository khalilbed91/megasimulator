using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;

namespace MegaSimulator.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Microsoft.AspNetCore.Authorization.Authorize]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        private Guid? GetCallerUserId()
        {
            var idStr = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            return Guid.TryParse(idStr, out var id) ? id : null;
        }

        private bool IsAdmin() => User.IsInRole("admin");

        [HttpGet("{id}")]
        public async Task<ActionResult<UserDto>> Get(Guid id)
        {
            var callerId = GetCallerUserId();
            if (callerId == null) return Unauthorized();
            if (id != callerId.Value && !IsAdmin()) return Forbid();

            var u = await _service.GetByIdAsync(id);
            if (u == null) return NotFound();
            return Ok(u);
        }

        [HttpGet("username/{username}")]
        public async Task<ActionResult<UserDto>> GetByUsername(string username)
        {
            if (!IsAdmin()) return Forbid();

            var u = await _service.GetByUsernameAsync(username);
            if (u == null) return NotFound();
            return Ok(u);
        }

        [HttpPost]
        public async Task<ActionResult<UserDto>> Create([FromBody] UserDto dto)
        {
            if (!IsAdmin()) return Forbid();
            var created = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(Get), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] UserDto dto)
        {
            var callerId = GetCallerUserId();
            if (callerId == null) return Unauthorized();
            if (id != callerId.Value && !IsAdmin()) return Forbid();

            if (id != dto.Id) return BadRequest();
            await _service.UpdateAsync(dto);
            return NoContent();
        }

        [HttpPost("{id}/password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword(Guid id, [FromBody] ChangePasswordDto dto)
        {
            var ok = await _service.ChangePasswordAsync(id, dto.OldPassword, dto.NewPassword);
            if (!ok) return BadRequest(new { message = "Password change failed" });
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(Guid id)
        {
            var callerId = GetCallerUserId();
            if (callerId == null) return Unauthorized();
            if (id != callerId.Value && !IsAdmin()) return Forbid();

            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
