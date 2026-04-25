using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Enums
{
    public enum BookingStatus
    {
        Pending = 0,    // Очікує SMS верифікації (5 хв TTL)
        Confirmed = 1,  // Підтверджено клієнтом
        Completed = 2,  // Завершено майстром
        Cancelled = 3,  // Скасовано
        NoShow = 4      // Клієнт не прийшов
    }
}
