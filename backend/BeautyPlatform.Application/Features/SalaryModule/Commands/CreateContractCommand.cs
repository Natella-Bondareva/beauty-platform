using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.DTOs
{
    public record CreateContractCommand(
        Guid MasterId,
        ContractType Type,
        decimal Amount,
        int PaymentPeriodDays
    );
}
