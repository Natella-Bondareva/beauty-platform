using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.DTOs
{
    public class SubscriptionDto
    {
        public Guid Id { get; set; }
        public int MasterLimit { get; set; }
        public decimal MonthlyPrice { get; set; }
        public bool IsActive { get; set; }
        public List<SubscriptionModuleDto> Modules { get; set; } = new();
        public List<string> ActiveModules { get; set; } = new();
    }
}
