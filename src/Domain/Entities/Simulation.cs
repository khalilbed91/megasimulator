using System;

namespace MegaSimulator.Domain.Entities
{
    public class Simulation
    {
        public Guid Id { get; set; }
        public Guid UserId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Type { get; set; } = string.Empty; // e.g., "payroll"
        public string Payload { get; set; } = string.Empty; // JSON payload
        public bool IsActive { get; set; } = true;
        public string? Metadata { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}
