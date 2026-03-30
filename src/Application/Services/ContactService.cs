using System;
using System.Threading.Tasks;
using MegaSimulator.Application.DTOs;
using MegaSimulator.Application.Interfaces;
using MegaSimulator.Domain.Entities;
using MegaSimulator.Domain.Interfaces;

namespace MegaSimulator.Application.Services
{
    public class ContactService : IContactService
    {
        private readonly IContactRepository _repo;

        public ContactService(IContactRepository repo)
        {
            _repo = repo;
        }

        public async Task<ContactCreateResponseDto> CreateAsync(ContactRequestDto req, Guid? userId = null)
        {
            var name = (req.Name ?? string.Empty).Trim();
            var email = (req.Email ?? string.Empty).Trim();
            var msg = (req.Message ?? string.Empty).Trim();

            var entity = new ContactRequest
            {
                Id = Guid.NewGuid(),
                UserId = userId,
                Name = name,
                Email = email,
                Message = msg,
                Status = "new",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = null
            };

            await _repo.AddAsync(entity);

            return new ContactCreateResponseDto
            {
                Id = entity.Id,
                Status = entity.Status
            };
        }
    }
}

