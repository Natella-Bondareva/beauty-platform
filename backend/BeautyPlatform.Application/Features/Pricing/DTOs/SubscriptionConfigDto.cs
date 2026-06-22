using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.DTOs
{
    public class SubscriptionConfigDto
    {
        public decimal PricePerMaster { get; set; }
        public List<ModuleConfigDto> FreeModules { get; set; } = new();
        public List<ModuleConfigDto> PaidModules { get; set; } = new();
    }
}
