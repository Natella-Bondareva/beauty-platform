using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Responses
{
    public class CreateBookingResponse
    {
        public Guid BookingId { get; set; }
        public BookingStatus Status { get; set; }
        public DateTime ExpiresAt { get; set; }
        public string Message { get; set; } = default!;
        public int AttemptsAllowed { get; set; } = 3;
    }
}
