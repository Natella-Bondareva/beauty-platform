using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class BookingStatsDto
    {
        public int Total { get; set; }
        public int Completed { get; set; }
        public int Cancelled { get; set; }
        public int NoShow { get; set; }
        public int Pending { get; set; }
        public decimal CancellationRate { get; set; }  // %
        public decimal NoShowRate { get; set; }        // %
        public decimal CompletionRate { get; set; }    // %
    }
}
