using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class DailyRevenueDto
    {
        public DateOnly Date { get; set; }
        public decimal Revenue { get; set; }
        public int CompletedBookings { get; set; }
    }
}
