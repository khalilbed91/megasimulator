using System;

namespace MegaSimulator.Application.DTOs
{
    public record UserDto(Guid Id, string Username, string Email, DateTime CreatedAt, string? FirstName = null, string? LastName = null, string? Phone = null, string[]? Roles = null);
}
