using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Domain.Interfaces
{
    public interface ISalaireRepository
    {
        Task<Salaire?> GetByIdAsync(Guid id);
        Task<IEnumerable<Salaire>> ListByEmployeeAsync(Guid employeeId);
        Task AddAsync(Salaire salaire);
        Task UpdateAsync(Salaire salaire);
        Task DeleteAsync(Guid id);
    }
}
