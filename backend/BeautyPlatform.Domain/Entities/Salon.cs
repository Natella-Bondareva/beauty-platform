using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    public class Salon
    {
        public Guid Id { get; private set; }
        public Guid OwnerId { get; private set; }
        public string Name { get; private set; }
        public string Phone { get; private set; }
        public Address Address { get; private set; }
        public string Currency { get; private set; }
        public DateTime CreatedAt { get; private set; }
        public SalonSettings Settings { get; private set; }

        private Salon() { } // EF Core

        public Salon(Guid ownerId, string name, string phone, Address address)
        {
            Id = Guid.NewGuid();
            OwnerId = ownerId;
            SetName(name);
            SetPhone(phone);
            Address = address;
            Currency = "UAH";
            CreatedAt = DateTime.UtcNow;
            Settings = new SalonSettings(Id);
        }

        public void Update(string name, string phone, Address address)
        {
            SetName(name);
            SetPhone(phone);
            Address = address;
        }

        // Делегуємо зміну налаштувань через агрегат — не напряму
        public void UpdateSettings(TimeSpan opening, TimeSpan closing, int slotMinutes)
        {
            Settings.UpdateWorkingHours(opening, closing);
            Settings.SetSlotDuration(slotMinutes);
        }

        public void AddBreak(TimeSpan start, TimeSpan end) => Settings.AddBreak(start, end);

        public void EnsureOwnership(Guid userId)
        {
            if (OwnerId != userId)
                throw new UnauthorizedAccessException("You don't have access to this salon.");
        }

        private void SetName(string name)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Salon name is required");
            Name = name;
        }

        private void SetPhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                throw new ArgumentException("Phone is required");
            Phone = phone;
        }
    }

    // Address залишається без змін — він вже коректний
    public record Address(string Street, string City)
    {
        public static Address Create(string street, string city)
        {
            if (string.IsNullOrWhiteSpace(street)) throw new ArgumentException("Street is required");
            if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("City is required");
            return new Address(street, city);
        }
    }
}
