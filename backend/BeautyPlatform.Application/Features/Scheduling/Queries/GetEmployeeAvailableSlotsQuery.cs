using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.Queries
{
    /// <summary>Запит на отримання слотів конкретного майстра</summary>
    public record GetEmployeeAvailableSlotsQuery(
        Guid SalonId,
        Guid ServiceId,
        Guid EmployeeId,
        DateOnly Date
    );
}
