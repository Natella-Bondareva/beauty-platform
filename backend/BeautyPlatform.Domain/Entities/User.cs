using CRMService.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    public class User
    {
        public Guid Id { get; private set; }
        public Guid? SalonId { get; private set; } // nullable — салон ще не створений
        public string Email { get; private set; } = null!;
        public string PasswordHash { get; private set; } = null!;
        public string FirstName { get; private set; } = null!;
        public string LastName { get; private set; } = null!;
        public Guid RoleId { get; private set; }
        public bool IsActive { get; private set; }

        public Role Role { get; private set; } = null!;

        private User() { }

        private User(
            Guid id,
            string email,
            string passwordHash,
            string firstName,
            string lastName,
            Guid roleId)
        {
            Id = id;
            Email = email;
            PasswordHash = passwordHash;
            FirstName = firstName;
            LastName = lastName;
            RoleId = roleId;
            IsActive = true;
            // SalonId = null — поки не створено салон
        }

        public static User Create(
            string email,
            string passwordHash,
            string firstName,
            string lastName,
            Guid roleId)
        {
            if (string.IsNullOrWhiteSpace(email))
                throw new ArgumentException("Email is required");
            if (string.IsNullOrWhiteSpace(passwordHash))
                throw new ArgumentException("Password hash is required");
            if (string.IsNullOrWhiteSpace(firstName))
                throw new ArgumentException("First name is required");
            if (string.IsNullOrWhiteSpace(lastName))
                throw new ArgumentException("Last name is required");

            return new User(
                Guid.NewGuid(),
                email.ToLower(),
                passwordHash,
                firstName,
                lastName,
                roleId);
        }

        // Викликається після створення салону на другому кроці онбордингу
        public void AssignToSalon(Guid salonId)
        {
            if (SalonId.HasValue)
                throw new InvalidOperationException("User is already assigned to a salon.");
            SalonId = salonId;
        }

        public bool VerifyPassword(string password, IPasswordHasher hasher)
            => hasher.Verify(password, PasswordHash);

        public void Deactivate() => IsActive = false;
    }
}
