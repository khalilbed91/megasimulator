using System;

namespace MegaSimulator.Application.DTOs
{
    public record UserDto(Guid Id, string Username, string Email, DateTime CreatedAt, string[]? Roles = null);
}
