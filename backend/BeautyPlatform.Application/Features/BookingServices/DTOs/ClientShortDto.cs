using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.DTOs
{
    public class ClientShortDto
    {
        public Guid Id { get; set; }
        public string Phone { get; set; } = default!;
        public string? FullName { get; set; }
        public int NoShowCount { get; set; }
    }
}
