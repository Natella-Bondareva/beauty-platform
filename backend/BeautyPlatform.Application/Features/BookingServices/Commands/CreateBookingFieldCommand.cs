using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Commands
{
    public record CreateBookingFieldCommand(
        string Label,
        string? Placeholder,
        FieldType Type,
        FieldScope Scope,
        Guid? TargetId,
        bool IsRequired,
        int Order,
        List<string> Options  // для Select
    );
}
