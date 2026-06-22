using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class FinanceStatsDto
    {
        public decimal Revenue { get; set; }              // виручка за період
        public decimal PreviousPeriodRevenue { get; set; } // попередній період
        public decimal RevenueGrowthPercent { get; set; } // динаміка %
        public decimal AverageCheck { get; set; }          // середній чек
        public decimal ExpectedRevenue { get; set; }       // confirmed але ще не виконані
    }
}
