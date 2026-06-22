using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.DTOs
{
    public class SubscriptionModuleDto
    {
        public string Module { get; set; } = null!;
        public DateTime ExpiresAt { get; set; }
    }
}
