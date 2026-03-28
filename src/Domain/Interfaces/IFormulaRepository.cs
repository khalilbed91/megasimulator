using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Domain.Interfaces
{
    public interface IFormulaRepository
    {
        Task<Formula?> GetByNameAsync(string name);
        Task<IEnumerable<Formula>> ListAllAsync();
        Task AddAsync(Formula formula);
    }
}
