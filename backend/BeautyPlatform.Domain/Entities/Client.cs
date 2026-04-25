namespace CRMService.Domain.Entities
{
    public class Client
    {
        public Guid Id { get; private set; }
        public Guid SalonId { get; private set; }
        public string Phone { get; private set; } = default!;
        public string? FirstName { get; private set; }
        public string? LastName { get; private set; }
        public int NoShowCount { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public DateTime? LastVisitAt { get; private set; }

        // Navigation
        public Salon Salon { get; private set; } = default!;

        private readonly List<Booking> _bookings = new();
        public IReadOnlyCollection<Booking> Bookings => _bookings.AsReadOnly();

        private Client() { } // EF Core

        public Client(Guid salonId, string phone, string? firstName = null, string? lastName = null)
        {
            if (string.IsNullOrWhiteSpace(phone))
                throw new ArgumentException("Phone is required.");
            if (!System.Text.RegularExpressions.Regex.IsMatch(phone, @"^\+?[1-9]\d{7,14}$"))
                throw new ArgumentException("Invalid phone format.");

            Id = Guid.NewGuid();
            SalonId = salonId;
            Phone = phone;
            FirstName = firstName?.Trim();
            LastName = lastName?.Trim();
            NoShowCount = 0;
            CreatedAt = DateTime.UtcNow;
        }

        public void UpdateName(string? firstName, string? lastName)
        {
            FirstName = firstName?.Trim();
            LastName = lastName?.Trim();
        }

        public void RecordVisit() => LastVisitAt = DateTime.UtcNow;

        public void IncrementNoShow() => NoShowCount++;

        public string FullName =>
            string.Join(" ", new[] { FirstName, LastName }
                .Where(s => !string.IsNullOrWhiteSpace(s)));
    }
}