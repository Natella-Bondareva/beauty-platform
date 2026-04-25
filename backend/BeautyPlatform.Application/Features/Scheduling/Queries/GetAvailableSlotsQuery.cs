using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.Queries
{
    /// <summary>Запит на отримання слотів по послузі (всі майстри)</summary>
    public record GetAvailableSlotsQuery(
        Guid SalonId,
        Guid ServiceId,
        DateOnly Date
    );
}
