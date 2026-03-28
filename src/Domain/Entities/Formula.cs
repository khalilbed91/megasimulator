using System;

namespace MegaSimulator.Domain.Entities
{
    public class Formula
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Expression { get; set; } = string.Empty; // expression string (NCalc syntax)
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
