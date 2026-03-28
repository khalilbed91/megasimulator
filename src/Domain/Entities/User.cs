using System;

namespace MegaSimulator.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public string? PasswordHash { get; set; }
        public string[]? Roles { get; set; }
    }
}
