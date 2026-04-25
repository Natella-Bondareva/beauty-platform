using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.DTOs
{
    public class ServiceShortDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public int ClientDurationMinutes { get; set; }
    }
}
