using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.DTOs
{
    public class EmployeeBreakDto
    {
        public Guid Id { get; set; }
        public Guid EmployeeId { get; set; }
        public DateOnly Date { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public string? Reason { get; set; }
    }
}
