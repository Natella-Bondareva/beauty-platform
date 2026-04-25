using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    /// <summary>
    /// Перерва майстра на конкретну дату і час.
    /// Наприклад: 2024-04-05 13:00-14:00 — обід
    /// </summary>
    public class EmployeeBreak
    {
        public Guid Id { get; private set; }
        public Guid EmployeeId { get; private set; }

        /// <summary>Дата перерви (без часу)</summary>
        public DateOnly Date { get; private set; }

        /// <summary>Час початку в timezone салону</summary>
        public TimeSpan StartTime { get; private set; }

        /// <summary>Час кінця в timezone салону</summary>
        public TimeSpan EndTime { get; private set; }

        public string? Reason { get; private set; }
        public DateTime CreatedAt { get; private set; }

        // Navigation
        public Employee Employee { get; private set; } = default!;

        private EmployeeBreak() { } // EF Core

        public EmployeeBreak(
            Guid employeeId,
            DateOnly date,
            TimeSpan startTime,
            TimeSpan endTime,
            string? reason = null)
        {
            if (startTime >= endTime)
                throw new ArgumentException("Break start time must be before end time.");
            if (endTime - startTime > TimeSpan.FromHours(24))
                throw new ArgumentException("Break cannot exceed 24 hours.");

            Id = Guid.NewGuid();
            EmployeeId = employeeId;
            Date = date;
            StartTime = startTime;
            EndTime = endTime;
            Reason = reason?.Trim();
            CreatedAt = DateTime.UtcNow;
        }

        public void Update(TimeSpan startTime, TimeSpan endTime, string? reason)
        {
            if (startTime >= endTime)
                throw new ArgumentException("Break start time must be before end time.");

            StartTime = startTime;
            EndTime = endTime;
            Reason = reason?.Trim();
        }

        /// <summary>Перевірка чи перетинається перерва з часовим інтервалом</summary>
        public bool OverlapsWith(TimeSpan start, TimeSpan end)
            => StartTime < end && EndTime > start;
    }
}