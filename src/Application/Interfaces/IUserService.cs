using System;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Application.Interfaces
{
    public interface IUserService
    {
        Task<UserDto?> GetByIdAsync(Guid id);
        Task<UserDto?> GetByUsernameAsync(string username);
        Task<UserDto> CreateAsync(UserDto dto);
        Task UpdateAsync(UserDto dto);
        Task DeleteAsync(Guid id);
        Task<bool> ChangePasswordAsync(Guid id, string oldPassword, string newPassword);
    }
}
