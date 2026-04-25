using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Commands
{
    public record CreateBookingCommand(
        Guid SalonId,
        Guid ServiceId,
        Guid EmployeeId,
        DateTime StartTimeUtc,
        string ClientPhone,
        string? ClientFirstName,
        string? ClientLastName
    );
}
