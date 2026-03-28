using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Application.Interfaces
{
    public interface IFormulaService
    {
        Task<Formula?> GetByNameAsync(string name);
        Task<IEnumerable<Formula>> ListAllAsync();
        Task<object?> EvaluateAsync(string expression, IDictionary<string, object?> parameters);
    }
}
