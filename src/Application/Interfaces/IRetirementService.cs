using System;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Application.Interfaces
{
    public interface IRetirementService
    {
        Task<RetirementResponseDto> Simulate(RetirementRequestDto req, Guid? userId = null);
        int GetTrimestresRequis(int anneeNaissance);
        int GetAgeLegal(int anneeNaissance);
        decimal ComputeDecote(int trimestresValides, int trimestresRequis);
        decimal ComputeSurcote(int trimestresValides, int trimestresRequis);
    }
}
