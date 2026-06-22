using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Enums
{
    public enum ContractType
    {
        FixedRate = 0,   // фіксована ставка за період
        Percentage = 1   // відсоток від виконаних записів
    }
}
