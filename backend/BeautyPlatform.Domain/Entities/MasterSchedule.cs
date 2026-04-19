using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    /// <summary>
    /// Розклад роботи майстра по днях тижня.
    /// IsWorking = false → майстер у цей день не працює (вихідний).
    /// </summary>
    public class MasterSchedule
    {
        public Guid Id { get; private set; }
        public Guid EmployeeId { get; private set; }

        /// <summary>0 = Sunday, 1 = Monday, ..., 6 = Saturday (DayOfWeek enum)</summary>
        public DayOfWeek DayOfWeek { get; private set; }

        public TimeSpan StartTime { get; private set; }
        public TimeSpan EndTime { get; private set; }
        public bool IsWorking { get; private set; }

        // Navigation
        public Employee Employee { get; private set; } = default!;

        private MasterSchedule() { } // EF Core

        public MasterSchedule(Guid employeeId, DayOfWeek dayOfWeek, TimeSpan startTime, TimeSpan endTime, bool isWorking = true)
        {
            if (isWorking && startTime >= endTime)
                throw new ArgumentException("Start time must be before end time.");

            Id = Guid.NewGuid();
            EmployeeId = employeeId;
            DayOfWeek = dayOfWeek;
            StartTime = startTime;
            EndTime = endTime;
            IsWorking = isWorking;
        }

        public void Update(TimeSpan startTime, TimeSpan endTime, bool isWorking)
        {
            if (isWorking && startTime >= endTime)
                throw new ArgumentException("Start time must be before end time.");

            StartTime = startTime;
            EndTime = endTime;
            IsWorking = isWorking;
        }

        public void SetDayOff() => IsWorking = false;
    }
}
