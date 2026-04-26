using System;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Application.Interfaces
{
    public interface IInsuranceService
    {
        Task<InsuranceResponseDto> Simulate(InsuranceRequestDto req, Guid? userId = null);
        decimal UpdateCrm(decimal currentCrm, int fullResponsibleClaims, int partialResponsibleClaims, bool crmApplicable = true);
    }
}
