using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Application.Interfaces
{
    public interface ISalaireService
    {
        Task<SalaireDto?> GetByIdAsync(Guid id);
        Task<IEnumerable<SalaireDto>> ListByEmployeeAsync(Guid employeeId);
        Task<SalaireDto> CreateAsync(SalaireDto dto);
    }
}
