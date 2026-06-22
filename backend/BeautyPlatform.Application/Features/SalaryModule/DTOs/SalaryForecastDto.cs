using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.DTOs
{
    public class SalaryForecastDto
    {
        public Guid MasterId { get; set; }
        public string MasterName { get; set; } = null!;
        public decimal ForecastAmount { get; set; }       // прогноз по запланованих
        public decimal EarnedSoFar { get; set; }          // вже зароблено в поточному періоді
        public int PlannedBookingsCount { get; set; }
        public int CompletedBookingsCount { get; set; }
        public DateTime PeriodEnd { get; set; }
    }
}
