using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.Queries
{
    /// <summary>Сценарій 2 — всі слоти майстра без прив'язки до послуги</summary>
    public record GetEmployeeAllSlotsQuery(
        Guid SalonId,
        Guid EmployeeId,
        DateOnly Date
    );
}
