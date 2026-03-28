using System;

namespace MegaSimulator.Application.DTOs
{
    public record SalaireDto(Guid Id, Guid EmployeeId, decimal BaseSalary, decimal Bonuses, DateTime EffectiveDate);
}
