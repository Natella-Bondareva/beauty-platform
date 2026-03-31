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
        public Guid SalonId { get; private set; }

        public string Email { get; private set; } = null!;
        public string PasswordHash { get; private set; } = null!;

        public string FirstName { get; private set; } = null!;
        public string LastName { get; private set; } = null!;

        public Guid RoleId { get; private set; }

        public bool IsActive { get; private set; }

        // Navigation
        public Role Role { get; private set; } = null!;

        private User() { } // EF Core

        private User(
            Guid id,
            Guid salonId,
            string email,
            string passwordHash,
            string firstName,
            string lastName,
            Guid roleId)
        {
            Id = id;
            SalonId = salonId;
            Email = email;
            PasswordHash = passwordHash;
            FirstName = firstName;
            LastName = lastName;
            RoleId = roleId;
            IsActive = true;
        }

        // 🔥 Factory Method (важливо)
        public static User Create(
            Guid salonId,
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

            return new User(
                Guid.NewGuid(),
                salonId,
                email.ToLower(),
                passwordHash,
                firstName,
                lastName,
                roleId);
        }

        // 🔐 Перевірка пароля
        public bool VerifyPassword(string password, IPasswordHasher hasher)
        {
            return hasher.Verify(password, PasswordHash);
        }

        public void Deactivate()
        {
            IsActive = false;
        }
    }
}
