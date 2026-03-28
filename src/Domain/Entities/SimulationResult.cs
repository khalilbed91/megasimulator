using System;

namespace MegaSimulator.Domain.Entities
{
    public class SimulationResult
    {
        public Guid Id { get; set; }
        public Guid SimulationId { get; set; }
        public string Result { get; set; } = string.Empty; // JSON
        public DateTime CreatedAt { get; set; }
    }
}
