using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.DTOs
{
    public class BookingDto
    {
        public Guid Id { get; set; }
        public Guid SalonId { get; set; }
        public BookingStatus Status { get; set; }
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }
        public decimal Price { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string? CancellationReason { get; set; }
        public DateTime CreatedAt { get; set; }

        public ClientShortDto Client { get; set; } = default!;
        public EmployeeShortDto Employee { get; set; } = default!;
        public ServiceShortDto Service { get; set; } = default!;
    }
}
