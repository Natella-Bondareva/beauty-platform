using CRMService.Application.Features.Employess.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.DTOs
{
    public class ScheduleConstraintsDto
    {
        /// <summary>Мінімально можливий час початку (час відкриття салону)</summary>
        public TimeSpan SalonOpeningTime { get; set; }

        /// <summary>Максимально можливий час завершення (час закриття салону)</summary>
        public TimeSpan SalonClosingTime { get; set; }

        /// <summary>Поточний розклад майстра</summary>
        public List<ScheduleDto> CurrentSchedule { get; set; } = new();

        /// <summary>Дні коли салон не працює (регулярні вихідні)</summary>
        public List<DayOfWeek> SalonDaysOff { get; set; } = new();
    }
}
