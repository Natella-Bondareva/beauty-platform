

namespace CRMService.Domain.Entities
{
        /// <summary>
        /// M:M між Employee і Service.
        /// Кожен майстер може мати свою ціну і тривалість для послуги.
        /// null = використовується базове значення з Service.
        /// </summary>
        public class EmployeeService
        {
            public Guid EmployeeId { get; private set; }
            public Guid ServiceId { get; private set; }

            /// <summary>null = базова ціна з Service.Price</summary>
            public decimal? PriceOverride { get; private set; }

            /// <summary>null = базова тривалість з Service.SystemDurationMinutes</summary>
            public int? SystemDurationOverride { get; private set; }

            /// <summary>null = базова тривалість з Service.ClientDurationMinutes</summary>
            public int? ClientDurationOverride { get; private set; }

            public DateTime AssignedAt { get; private set; }

            // Navigation
            public Employee Employee { get; private set; } = default!;
            public Service Service { get; private set; } = default!;

            private EmployeeService() { }

            public EmployeeService(
                Guid employeeId,
                Guid serviceId,
                decimal? priceOverride = null,
                int? systemDurationOverride = null,
                int? clientDurationOverride = null)
            {
                ValidateOverrides(priceOverride, systemDurationOverride, clientDurationOverride);

                EmployeeId = employeeId;
                ServiceId = serviceId;
                PriceOverride = priceOverride;
                SystemDurationOverride = systemDurationOverride;
                ClientDurationOverride = clientDurationOverride;
                AssignedAt = DateTime.UtcNow;
            }

            public void UpdateOverrides(
                decimal? priceOverride,
                int? systemDurationOverride,
                int? clientDurationOverride)
            {
                ValidateOverrides(priceOverride, systemDurationOverride, clientDurationOverride);

                PriceOverride = priceOverride;
                SystemDurationOverride = systemDurationOverride;
                ClientDurationOverride = clientDurationOverride;
            }

            // ── Ефективні значення ─────────────────────────────────────

            public decimal GetEffectivePrice()
                => PriceOverride ?? Service.Price;

            public int GetEffectiveSystemDuration()
                => SystemDurationOverride ?? Service.SystemDurationMinutes;

            public int GetEffectiveClientDuration()
                => ClientDurationOverride ?? Service.ClientDurationMinutes;

            // ── Validation ─────────────────────────────────────────────

            private static void ValidateOverrides(
                decimal? price,
                int? systemDuration,
                int? clientDuration)
            {
                if (price.HasValue && price.Value < 0)
                    throw new ArgumentException("Price override cannot be negative.");

                if (systemDuration.HasValue && systemDuration.Value < 15)
                    throw new ArgumentException("System duration must be at least 15 minutes.");

                if (clientDuration.HasValue && clientDuration.Value < 15)
                    throw new ArgumentException("Client duration must be at least 15 minutes.");

                // Якщо обидва передані — перевіряємо співвідношення
                if (systemDuration.HasValue && clientDuration.HasValue
                    && clientDuration.Value > systemDuration.Value)
                    throw new ArgumentException("Client duration cannot exceed system duration.");
            }
        }
    }

