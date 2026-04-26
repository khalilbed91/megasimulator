using System.Collections.Generic;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;

namespace MegaSimulator.Application.Interfaces
{
    public interface IPostalCodeService
    {
        Task<IReadOnlyList<PostalCodeDto>> SearchAsync(string query, int limit = 12);
        Task<PostalCodeDto?> GetBestMatchAsync(string postalCode);
    }
}
