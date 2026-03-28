using System;
using System.Threading.Tasks;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Domain.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(Guid id);
        Task<User?> GetByUsernameAsync(string username);
        Task AddAsync(User user);
        Task UpdateAsync(User user);
        Task DeleteAsync(Guid id);
    }
}
