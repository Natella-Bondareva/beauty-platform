using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.DTOs
{
    public record UpdateContractCommand(
        decimal Amount,
        int PaymentPeriodDays
    );
}
