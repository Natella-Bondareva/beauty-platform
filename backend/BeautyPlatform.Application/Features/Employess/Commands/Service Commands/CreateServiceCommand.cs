using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.Commands.Service_Commands
{
    public record CreateServiceCommand(
        Guid CategoryId,       
        string Name,
        string? Description,
        int SystemDurationMinutes,
        int ClientDurationMinutes,
        decimal Price
    );
}
