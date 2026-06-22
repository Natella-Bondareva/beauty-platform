using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.DTOs
{
    public class SalaryPaymentDto
    {
        public Guid Id { get; set; }
        public Guid MasterId { get; set; }
        public string MasterName { get; set; } = null!;
        public DateTime PeriodStart { get; set; }
        public DateTime PeriodEnd { get; set; }
        public decimal EarnedAmount { get; set; }
        public decimal ForecastAmount { get; set; }
        public string Status { get; set; } = null!;
        public DateTime? PaidAt { get; set; }
        public string? Note { get; set; }
    }
}
