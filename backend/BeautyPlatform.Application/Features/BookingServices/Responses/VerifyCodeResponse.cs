using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Responses
{
    public class VerifyCodeResponse
    {
        public Guid BookingId { get; set; }
        public BookingStatus Status { get; set; }
        public bool Success { get; set; }
        public int AttemptsLeft { get; set; }
        public string? Message { get; set; }
    }
}
