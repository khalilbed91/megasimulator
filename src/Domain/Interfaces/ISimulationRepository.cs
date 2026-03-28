using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Domain.Interfaces
{
    public interface ISimulationRepository
    {
        Task<Simulation?> GetByIdAsync(Guid id);
        Task<IEnumerable<Simulation>> ListByUserAsync(Guid userId);
        Task AddAsync(Simulation simulation);
        Task UpdateAsync(Simulation simulation);
        Task DeleteAsync(Guid id);
    }
}
