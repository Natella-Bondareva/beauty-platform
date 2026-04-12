using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Commands
{
    public record CreateSalonCommand(
        string Name,
        string Phone,
        string Street,
        string City
    );
}
