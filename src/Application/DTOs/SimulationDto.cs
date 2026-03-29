using System;

namespace MegaSimulator.Application.DTOs
{
    public record SimulationDto(
        Guid Id,
        Guid? UserId,
        string Name,
        string Type,
        string Payload,
        bool IsActive,
        string? Metadata,
        DateTime CreatedAt,
        DateTime? UpdatedAt
    );
}
