using CRMService.Domain.Enums;

namespace CRMService.Domain.Entities
{
    public class Booking
    {
        public Guid Id { get; private set; }
        public Guid SalonId { get; private set; }
        public Guid ClientId { get; private set; }
        public Guid EmployeeId { get; private set; }
        public Guid ServiceId { get; private set; }

        public BookingStatus Status { get; private set; }

        /// <summary>Час початку в UTC</summary>
        public DateTime StartTimeUtc { get; private set; }

        /// <summary>Час кінця в UTC (SystemDuration)</summary>
        public DateTime EndTimeUtc { get; private set; }

        /// <summary>Зафіксована ціна на момент бронювання</summary>
        public decimal Price { get; private set; }

        /// <summary>Час до якого клієнт має підтвердити SMS</summary>
        public DateTime ExpiresAt { get; private set; }

        public string? CancellationReason { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? ConfirmedAt { get; private set; }
        public DateTime? CompletedAt { get; private set; }
        public DateTime? CancelledAt { get; private set; }

        // Navigation
        public Salon Salon { get; private set; } = default!;
        public Client Client { get; private set; } = default!;
        public Employee Employee { get; private set; } = default!;
        public Service Service { get; private set; } = default!;

        private static readonly TimeSpan PendingTtl = TimeSpan.FromMinutes(5);
        private static readonly TimeSpan CancellationBuffer = TimeSpan.FromHours(2);

        private Booking() { } // EF Core

        public Booking(
            Guid salonId,
            Guid clientId,
            Guid employeeId,
            Guid serviceId,
            DateTime startTimeUtc,
            DateTime endTimeUtc,
            decimal price)
        {
            if (startTimeUtc >= endTimeUtc)
                throw new ArgumentException("Start time must be before end time.");
            if (startTimeUtc <= DateTime.UtcNow.AddMinutes(15))
                throw new ArgumentException("Booking must be at least 15 minutes in the future.");

            Id = Guid.NewGuid();
            SalonId = salonId;
            ClientId = clientId;
            EmployeeId = employeeId;
            ServiceId = serviceId;
            StartTimeUtc = startTimeUtc;
            EndTimeUtc = endTimeUtc;
            Price = price;
            Status = BookingStatus.Pending;
            ExpiresAt = DateTime.UtcNow.Add(PendingTtl);
            CreatedAt = DateTime.UtcNow;
        }

        // ── State Machine ──────────────────────────────────────────

        /// <summary>Підтвердження після SMS верифікації</summary>
        public void Confirm()
        {
            if (Status != BookingStatus.Pending)
                throw new InvalidOperationException($"Cannot confirm booking with status {Status}.");
            if (DateTime.UtcNow > ExpiresAt)
                throw new InvalidOperationException("Booking confirmation time has expired.");

            Status = BookingStatus.Confirmed;
            ConfirmedAt = DateTime.UtcNow;
        }

        /// <summary>Скасування клієнтом або адміністратором</summary>
        public void Cancel(string reason)
        {
            if (Status == BookingStatus.Completed)
                throw new InvalidOperationException("Cannot cancel a completed booking.");
            if (Status == BookingStatus.NoShow)
                throw new InvalidOperationException("Cannot cancel a no-show booking.");
            if (Status == BookingStatus.Cancelled)
                throw new InvalidOperationException("Booking is already cancelled.");

            // Перевірка буфера 2 години тільки для підтверджених
            if (Status == BookingStatus.Confirmed &&
                StartTimeUtc - DateTime.UtcNow < CancellationBuffer)
                throw new InvalidOperationException(
                    "Cannot cancel booking less than 2 hours before start time.");

            if (string.IsNullOrWhiteSpace(reason))
                throw new ArgumentException("Cancellation reason is required.");

            Status = BookingStatus.Cancelled;
            CancellationReason = reason.Trim();
            CancelledAt = DateTime.UtcNow;
        }

        /// <summary>Завершення майстром після надання послуги</summary>
        public void Complete()
        {
            if (Status != BookingStatus.Confirmed)
                throw new InvalidOperationException("Can only complete a confirmed booking.");

            Status = BookingStatus.Completed;
            CompletedAt = DateTime.UtcNow;
        }

        /// <summary>Позначити як неявку (background job)</summary>
        public void MarkAsNoShow()
        {
            if (Status != BookingStatus.Confirmed)
                throw new InvalidOperationException("Can only mark confirmed bookings as no-show.");
            if (DateTime.UtcNow < EndTimeUtc)
                throw new InvalidOperationException("Cannot mark as no-show before booking end time.");

            Status = BookingStatus.NoShow;
        }

        /// <summary>Автоматичне скасування після закінчення TTL (background job)</summary>
        public void ExpirePending()
        {
            if (Status != BookingStatus.Pending)
                throw new InvalidOperationException("Can only expire pending bookings.");

            Status = BookingStatus.Cancelled;
            CancellationReason = "Expired — SMS not verified in time.";
            CancelledAt = DateTime.UtcNow;
        }

        public bool IsExpired => Status == BookingStatus.Pending && DateTime.UtcNow > ExpiresAt;
    }
}