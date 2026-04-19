using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    /// <summary>
    /// M:M між Employee і Service.
    /// Може мати PriceOverride — якщо майстер бере іншу ціну ніж базова.
    /// </summary>
    public class EmployeeService
    {
        public Guid EmployeeId { get; private set; }
        public Guid ServiceId { get; private set; }

        /// <summary>null = використовується базова ціна з Service</summary>
        public decimal? PriceOverride { get; private set; }

        public DateTime AssignedAt { get; private set; }

        // Navigation
        public Employee Employee { get; private set; } = default!;
        public Service Service { get; private set; } = default!;

        private EmployeeService() { } // EF Core

        public EmployeeService(Guid employeeId, Guid serviceId, decimal? priceOverride = null)
        {
            if (priceOverride.HasValue && priceOverride.Value < 0)
                throw new ArgumentException("Price override cannot be negative.");

            EmployeeId = employeeId;
            ServiceId = serviceId;
            PriceOverride = priceOverride;
            AssignedAt = DateTime.UtcNow;
        }

        public void UpdatePriceOverride(decimal? price)
        {
            if (price.HasValue && price.Value < 0)
                throw new ArgumentException("Price override cannot be negative.");
            PriceOverride = price;
        }

        /// <summary>Фактична ціна: override якщо є, інакше базова</summary>
        public decimal GetEffectivePrice() =>
            PriceOverride ?? Service.Price;
    }
}
