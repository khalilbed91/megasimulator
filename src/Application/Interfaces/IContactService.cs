using System;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Application.Interfaces
{
    public interface IContactService
    {
        Task<ContactCreateResponseDto> CreateAsync(ContactRequestDto req, Guid? userId = null);
    }
}

