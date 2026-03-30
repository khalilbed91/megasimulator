using System.ComponentModel.DataAnnotations;

namespace MegaSimulator.Application.DTOs
{
    public class ContactRequestDto
    {
        [Required]
        [StringLength(80, MinimumLength = 2)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        [StringLength(120)]
        public string Email { get; set; } = string.Empty;

        [Required]
        [StringLength(2000, MinimumLength = 10)]
        public string Message { get; set; } = string.Empty;
    }
}

