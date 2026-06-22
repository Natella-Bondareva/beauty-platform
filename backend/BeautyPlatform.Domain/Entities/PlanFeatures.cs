using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CRMService.Domain.Enums;

namespace CRMService.Domain.Entities
{
    public static class PlanFeatures
    {
        public const decimal PricePerMaster = 45m;      // грн/міс

        public static decimal GetModulePrice(ModuleType module) => module switch
        {
            ModuleType.Analytics => 99m,
            ModuleType.Notifications => 79m,
            ModuleType.PRRO => 149m,
            _ => 0m  // Salary, OnlineBooking — безкоштовні
        };

        // Модулі що входять в базовий безкоштовний план
        public static IReadOnlyCollection<ModuleType> FreeModules => new[]
        {
        ModuleType.Salary,
        ModuleType.OnlineBooking
    };

        public static bool IsModuleFree(ModuleType module)
            => FreeModules.Contains(module);

    }
}
