using System;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Application.Interfaces
{
    public interface ILoanService
    {
        Task<LoanResponseDto> Simulate(LoanRequestDto req, Guid? userId = null);
        decimal MonthlyAnnuity(decimal principal, decimal annualNominalPercent, int months);
    }
}
