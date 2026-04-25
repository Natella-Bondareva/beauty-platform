using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.DTOs
{
    public class EmployeeAvailabilityDto
    {
        public Guid EmployeeId { get; set; }
        public string EmployeeName { get; set; } = default!;
        public string? AvatarUrl { get; set; }
        public decimal Price { get; set; }
        public List<SlotTimeDto> Slots { get; set; } = new();
    }
}
