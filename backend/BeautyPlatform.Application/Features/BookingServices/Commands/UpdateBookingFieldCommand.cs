using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Commands
{
    public record UpdateBookingFieldCommand(
        string Label,
        bool IsRequired,
        string? Placeholder
    );
}
