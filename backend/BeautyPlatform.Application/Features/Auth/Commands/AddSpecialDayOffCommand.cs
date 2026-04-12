using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Commands
{
    public record AddSpecialDayOffCommand(DateTime Date, string? Reason);
}
