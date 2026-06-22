using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Enums
{
    public enum FieldScope
    {
        Salon = 0,      // для всіх записів
        Service = 1,    // для конкретної послуги
        Master = 2      // для конкретного майстра
    }
}
