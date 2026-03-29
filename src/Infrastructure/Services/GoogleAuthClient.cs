using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using MegaSimulator.Application.Interfaces;

namespace MegaSimulator.Infrastructure.Services
{
    public class GoogleAuthClient : IGoogleAuthClient
    {
        private readonly HttpClient _client;
        private readonly IConfiguration _config;

        public GoogleAuthClient(HttpClient client, IConfiguration config)
        {
            _client = client;
            _config = config;
        }

        public async Task<string?> ExchangeCodeForAccessTokenAsync(string code, string redirectUri)
        {
            var client = _client;
            var clientId = _config["GOOGLE:ClientId"] ?? Environment.GetEnvironmentVariable("GOOGLE__CLIENTID");
            var clientSecret = _config["GOOGLE:ClientSecret"] ?? Environment.GetEnvironmentVariable("GOOGLE__CLIENTSECRET");
            var tokenEndpoint = "https://oauth2.googleapis.com/token";

            var body = new System.Collections.Generic.Dictionary<string, string>
            {
                { "code", code },
                { "client_id", clientId ?? string.Empty },
                { "client_secret", clientSecret ?? string.Empty },
                { "redirect_uri", redirectUri },
                { "grant_type", "authorization_code" }
            };

            var res = await client.PostAsync(tokenEndpoint, new FormUrlEncodedContent(body));
            if (!res.IsSuccessStatusCode) return null;
            var txt = await res.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(txt);
            if (doc.RootElement.TryGetProperty("access_token", out var at)) return at.GetString();
            return null;
        }

        public async Task<GoogleUserInfo?> GetUserInfoAsync(string accessToken)
        {
            var client = _client;
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var res = await client.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");
            if (!res.IsSuccessStatusCode) return null;
            var txt = await res.Content.ReadAsStringAsync();
            try
            {
                var info = JsonSerializer.Deserialize<GoogleUserInfo>(txt, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                return info;
            }
            catch
            {
                return null;
            }
        }

        public async Task<GoogleUserInfo?> VerifyIdTokenAsync(string idToken, string expectedAudience)
        {
            // Use Google's tokeninfo endpoint — no client secret needed
            var url = $"https://oauth2.googleapis.com/tokeninfo?id_token={Uri.EscapeDataString(idToken)}";
            var res = await _client.GetAsync(url);
            if (!res.IsSuccessStatusCode) return null;

            var txt = await res.Content.ReadAsStringAsync();
            try
            {
                using var doc = JsonDocument.Parse(txt);
                var root = doc.RootElement;

                // Verify the token was issued for our client ID
                if (root.TryGetProperty("aud", out var aud))
                {
                    if (aud.GetString() != expectedAudience) return null;
                }

                return new GoogleUserInfo
                {
                    Sub        = root.TryGetProperty("sub",         out var sub)  ? sub.GetString()  : null,
                    Email      = root.TryGetProperty("email",       out var em)   ? em.GetString()   : null,
                    Name       = root.TryGetProperty("name",        out var nm)   ? nm.GetString()   : null,
                    Given_Name = root.TryGetProperty("given_name",  out var gn)   ? gn.GetString()   : null,
                    Family_Name= root.TryGetProperty("family_name", out var fn)   ? fn.GetString()   : null,
                };
            }
            catch
            {
                return null;
            }
        }
    }
}
