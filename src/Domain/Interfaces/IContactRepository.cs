using System.Threading.Tasks;
using MegaSimulator.Domain.Entities;

namespace MegaSimulator.Domain.Interfaces
{
    public interface IContactRepository
    {
        Task AddAsync(ContactRequest req);
    }
}

