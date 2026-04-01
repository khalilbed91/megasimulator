using System;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Application.Interfaces
{
    public interface ISavingsService
    {
        Task<SavingsResponseDto> Simulate(SavingsRequestDto req, Guid? userId);
    }
}
