using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;
using NCalc;

namespace MegaSimulator.Application.Services
{
    public class FormulaService : IFormulaService
    {
        private readonly IFormulaRepository _repo;

        public FormulaService(IFormulaRepository repo)
        {
            _repo = repo;
        }

        public async Task<Formula?> GetByNameAsync(string name)
        {
            return await _repo.GetByNameAsync(name);
        }

        public async Task<IEnumerable<Formula>> ListAllAsync()
        {
            return await _repo.ListAllAsync();
        }

        public Task<object?> EvaluateAsync(string expression, IDictionary<string, object?> parameters)
        {
            var expr = new Expression(expression);

            if (parameters != null)
            {
                foreach (var kv in parameters)
                {
                    expr.Parameters[kv.Key] = kv.Value;
                }
            }

            var result = expr.Evaluate();
            return Task.FromResult(result);
        }
    }
}
