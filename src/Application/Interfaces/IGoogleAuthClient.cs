using System.Threading.Tasks;

namespace MegaSimulator.Application.Interfaces
{
    public interface IGoogleAuthClient
    {
        Task<string?> ExchangeCodeForAccessTokenAsync(string code, string redirectUri);
        Task<GoogleUserInfo?> GetUserInfoAsync(string accessToken);
    }

    public class GoogleUserInfo
    {
        public string? Sub { get; set; }
        public string? Email { get; set; }
        public string? Name { get; set; }
        public string? Given_Name { get; set; }
        public string? Family_Name { get; set; }
    }
}
