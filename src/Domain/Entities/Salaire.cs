using System;

namespace MegaSimulator.Domain.Entities
{
    public class Salaire
    {
        public Guid Id { get; set; }
        public Guid EmployeeId { get; set; }
        public decimal BaseSalary { get; set; }
        public decimal Bonuses { get; set; }
        public DateTime EffectiveDate { get; set; }

        public decimal Total => BaseSalary + Bonuses;
    }
}
