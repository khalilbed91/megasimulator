using System;

namespace MegaSimulator.Domain.Entities
{
    public class ContactRequest
    {
        public Guid Id { get; set; }
        public Guid? UserId { get; set; }

        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;

        public string Status { get; set; } = "new";

        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}

