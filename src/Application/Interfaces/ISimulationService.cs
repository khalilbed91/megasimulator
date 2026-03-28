using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Application.Interfaces
{
    public interface ISimulationService
    {
        Task<SimulationDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<SimulationDto>> ListByUserAsync(Guid userId);
        Task<SimulationDto> CreateAsync(SimulationDto dto);
        Task UpdateAsync(SimulationDto dto);
        Task DeleteAsync(Guid id);
    }
}
