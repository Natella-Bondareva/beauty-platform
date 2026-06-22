using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CRMService.Domain.Enums;

namespace CRMService.Domain.Entities
{
public class SubscriptionModule
{
    public Guid Id { get; private set; }
    public Guid SubscriptionId { get; private set; }
    public ModuleType Module { get; private set; }
    public DateTime AddedAt { get; private set; }
    public DateTime ExpiresAt { get; private set; }
    public int Quantity { get; private set; } // для майстрів — кількість слотів

    private SubscriptionModule() { }

    public SubscriptionModule(Guid subscriptionId, ModuleType module, int months, int quantity = 1)
    {
        Id = Guid.NewGuid();
        SubscriptionId = subscriptionId;
        Module = module;
        AddedAt = DateTime.UtcNow;
        ExpiresAt = DateTime.UtcNow.AddMonths(months);
        Quantity = quantity;
    }

    public bool IsExpired() => ExpiresAt < DateTime.UtcNow;
}
}
