using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.DTOs
{
    public class BookingListItemDto
    {
        public Guid Id { get; set; }
        public BookingStatus Status { get; set; }
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }
        public decimal Price { get; set; }
        public string ClientPhone { get; set; } = default!;
        public string ClientName { get; set; } = default!;
        public string EmployeeName { get; set; } = default!;
        public string ServiceName { get; set; } = default!;
    }
}
