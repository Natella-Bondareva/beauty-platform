using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string Role { get; set; } = null!;
        // Фронтенд знає на який крок онбордингу відправити юзера
        public bool HasSalon { get; set; }
        public Guid? SalonId { get; set; }
        public Guid UserId { get; set; }
    }
}
