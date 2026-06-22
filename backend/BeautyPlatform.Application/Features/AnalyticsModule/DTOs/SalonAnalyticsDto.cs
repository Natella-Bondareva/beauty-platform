using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class SalonAnalyticsDto
    {
        public FinanceStatsDto Finance { get; set; } = new();
        public BookingStatsDto Bookings { get; set; } = new();
        public List<EmployeeStatsDto> Employees { get; set; } = new();
        public List<ServiceStatsDto> TopServices { get; set; } = new();
        public ClientStatsDto Clients { get; set; } = new();
        public List<DailyRevenueDto> RevenueChart { get; set; } = new();
    }
}
