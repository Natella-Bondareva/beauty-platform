using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Commands
{
    public class LoginUserCommand
    {
        public string Email { get; set; } = null!;
        public string Password { get; set; } = null!;
    }
}
