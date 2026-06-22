using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CRMService.Domain.Enums;

namespace CRMService.Domain.Entities
{
public class Subscription
{
    public Guid Id { get; private set; }
    public Guid SalonId { get; private set; }
    public int PaidMasterSlots { get; private set; } // скільки додаткових майстрів оплачено
    public DateTime CreatedAt { get; private set; }
    public bool IsActive { get; private set; }

    private readonly List<SubscriptionModule> _modules = new();
    public IReadOnlyCollection<SubscriptionModule> Modules => _modules;

    private Subscription() { }

    public static Subscription CreateFree(Guid salonId)
    {
        return new Subscription
        {
            Id = Guid.NewGuid(),
            SalonId = salonId,
            PaidMasterSlots = 0, // 1 майстер безкоштовно
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };
    }

    // Максимальна кількість майстрів = 1 безкоштовний + оплачені
    public int GetMasterLimit() => 1 + PaidMasterSlots;

    // Додати слоти для майстрів (оплата за кількість)
    public void AddMasterSlots(int count, int months)
    {
        if (count <= 0)
            throw new ArgumentException("Count must be greater than 0.");
        PaidMasterSlots += count;
        _modules.Add(new SubscriptionModule(
            Id,
            ModuleType.Salary, // використовуємо як маркер для майстрів
            months,
            count
        ));
    }

    public void AddModule(ModuleType module, int months)
    {
        if (PlanFeatures.IsModuleFree(module))
            throw new InvalidOperationException($"{module} is included in the free plan.");
        if (HasModule(module))
            throw new InvalidOperationException($"{module} is already active.");

        _modules.Add(new SubscriptionModule(Id, module, months));
    }

    public bool HasModule(ModuleType module)
    {
        if (PlanFeatures.IsModuleFree(module)) return true;
        return _modules.Any(x => x.Module == module && !x.IsExpired());
    }

    // Підрахунок місячної вартості
    public decimal CalculateMonthlyPrice()
    {
        var masterPrice = PaidMasterSlots * PlanFeatures.PricePerMaster;
        var modulesPrice = _modules
            .Where(x => !x.IsExpired())
            .Sum(x => PlanFeatures.GetModulePrice(x.Module));
        return masterPrice + modulesPrice;
    }
}
}
