using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Domain.Interfaces
{
    public interface ISimulationResultRepository
    {
        Task AddAsync(SimulationResult result);
        Task<IEnumerable<SimulationResult>> ListBySimulationAsync(Guid simulationId);
        Task<SimulationResult?> GetByIdAsync(Guid id);
    }
}
