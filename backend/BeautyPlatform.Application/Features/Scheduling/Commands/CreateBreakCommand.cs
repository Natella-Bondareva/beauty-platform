using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.Commands
{
    public record CreateBreakCommand(
        DateOnly Date,
        TimeSpan StartTime,
        TimeSpan EndTime,
        string? Reason
    );
}
