using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.Commands.Service_Commands
{
    public record CreateCategoryCommand(
        string Name,
        string? Description,
        string? IconUrl
    );
}
