using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.Commands.Employee_Commands
{
    public record UpdateEmployeeCommand(
        List<Guid> CategoryIds,    
        string FullName,
        string Phone,
        string? Email,
        string? AvatarUrl
    );
}
