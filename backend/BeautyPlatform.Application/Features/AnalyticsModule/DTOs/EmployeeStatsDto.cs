using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class EmployeeStatsDto
    {
        public Guid EmployeeId { get; set; }
        public string FullName { get; set; } = null!;
        public string? AvatarUrl { get; set; }
        public decimal Revenue { get; set; }
        public int CompletedBookings { get; set; }
        public decimal WorkloadPercent { get; set; }   // завантаженість %
        public decimal AverageCheck { get; set; }
    }
}
