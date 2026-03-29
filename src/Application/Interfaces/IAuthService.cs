using System.Threading.Tasks;

namespace MegaSimulator.Application.Interfaces
{
    public interface IAuthService
    {
        Task<string?> AuthenticateAsync(string username, string password);
        string GenerateTokenForUser(MegaSimulator.Domain.Entities.User user);
    }
}
