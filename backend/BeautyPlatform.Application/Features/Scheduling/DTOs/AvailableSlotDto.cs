using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.DTOs
{
    /// <summary>Один доступний слот для бронювання</summary>
    public class AvailableSlotDto
    {
        public Guid EmployeeId { get; set; }
        public string EmployeeName { get; set; } = default!;
        public string? EmployeeAvatarUrl { get; set; }
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }

        /// <summary>Час для відображення клієнту (в timezone салону)</summary>
        public string StartTimeLocal { get; set; } = default!;
        public string EndTimeLocal { get; set; } = default!;

        public decimal Price { get; set; }
        public int ClientDurationMinutes { get; set; }
    }
}
