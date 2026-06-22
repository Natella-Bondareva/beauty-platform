using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.DTOs
{
    public class ContractDto
    {
        public Guid Id { get; set; }
        public Guid MasterId { get; set; }
        public string Type { get; set; } = null!;
        public decimal Amount { get; set; }
        public int PaymentPeriodDays { get; set; }
        public bool IsActive { get; set; }
        public DateTime StartedAt { get; set; }
    }
}
