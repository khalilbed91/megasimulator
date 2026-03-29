using System;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;

namespace MegaSimulator.Application.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _repo;

        public UserService(IUserRepository repo)
        {
            _repo = repo;
        }

        public async Task<UserDto?> GetByIdAsync(Guid id)
        {
            var u = await _repo.GetByIdAsync(id);
            if (u == null) return null;
            return new UserDto(u.Id, u.Username, u.Email, u.CreatedAt, u.FirstName, u.LastName, u.Phone, u.Roles);
        }

        public async Task<UserDto?> GetByUsernameAsync(string username)
        {
            var u = await _repo.GetByUsernameAsync(username);
            if (u == null) return null;
            return new UserDto(u.Id, u.Username, u.Email, u.CreatedAt, u.FirstName, u.LastName, u.Phone, u.Roles);
        }

        public async Task<UserDto> CreateAsync(UserDto dto)
        {
            var entity = new User
            {
                Id = dto.Id == Guid.Empty ? Guid.NewGuid() : dto.Id,
                Username = dto.Username,
                Email = dto.Email,
                CreatedAt = dto.CreatedAt == default ? DateTime.UtcNow : dto.CreatedAt,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone
            };

            await _repo.AddAsync(entity);

            return new UserDto(entity.Id, entity.Username, entity.Email, entity.CreatedAt);
        }

        public async Task UpdateAsync(UserDto dto)
        {
            var entity = new User
            {
                Id = dto.Id,
                Username = dto.Username,
                Email = dto.Email,
                CreatedAt = dto.CreatedAt,
                FirstName = dto.FirstName,
                LastName = dto.LastName,
                Phone = dto.Phone
            };

            await _repo.UpdateAsync(entity);
        }

        public async Task DeleteAsync(Guid id)
        {
            await _repo.DeleteAsync(id);
        }

        public async Task<bool> ChangePasswordAsync(Guid id, string oldPassword, string newPassword)
        {
            var existing = await _repo.GetByIdAsync(id);
            if (existing == null) return false;
            if (string.IsNullOrEmpty(existing.PasswordHash)) return false;
            var ok = false;
            try
            {
                ok = BCrypt.Net.BCrypt.Verify(oldPassword, existing.PasswordHash);
            }
            catch
            {
                return false;
            }
            if (!ok) return false;

            var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
            existing.PasswordHash = newHash;
            await _repo.UpdateAsync(existing);
            return true;
        }
    }
}
