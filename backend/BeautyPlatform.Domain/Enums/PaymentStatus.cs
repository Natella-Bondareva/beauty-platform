using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Enums
{
    public enum PaymentStatus
    {
        Pending = 0,  // нараховано, ще не виплачено
        Paid = 1      // виплачено
    }
}
