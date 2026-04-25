using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.DTOs
{
    public class EmployeeShortDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = default!;
        public string? AvatarUrl { get; set; }
    }
}
