using System;

namespace MegaSimulator.Application.DTOs
{
    public class ContactCreateResponseDto
    {
        public Guid Id { get; set; }
        public string Status { get; set; } = "new";
    }
}

