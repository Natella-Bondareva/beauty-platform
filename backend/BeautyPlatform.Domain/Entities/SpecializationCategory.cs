using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    /// <summary>
    /// Категорія спеціалізації майстра.
    /// IsGlobal = true  → системна, доступна всім салонам (seed data)
    /// IsGlobal = false → кастомна, належить конкретному салону
    /// </summary>
    public class SpecializationCategory
    {
        public Guid Id { get; private set; }
        public string Name { get; private set; } = default!;
        public string? Description { get; private set; }
        public string? IconUrl { get; private set; }
        public bool IsGlobal { get; private set; }

        /// <summary>null якщо IsGlobal = true</summary>
        public Guid? SalonId { get; private set; }
        public bool IsActive { get; private set; } = true;
        public DateTime CreatedAt { get; private set; }

        // Navigation
        public Salon? Salon { get; private set; }

        private readonly List<Employee> _employees = new();
        public IReadOnlyCollection<Employee> Employees => _employees.AsReadOnly();

        private readonly List<CategoryDefaultService> _defaultServices = new();
        public IReadOnlyCollection<CategoryDefaultService> DefaultServices => _defaultServices.AsReadOnly();

        private SpecializationCategory() { } // EF Core

        /// <summary>Системна категорія (seed data, доступна всім)</summary>
        public static SpecializationCategory CreateGlobal(string name, string? description = null, string? iconUrl = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Category name is required.");

            return new SpecializationCategory
            {
                Id = Guid.NewGuid(),
                Name = name.Trim(),
                Description = description?.Trim(),
                IconUrl = iconUrl,
                IsGlobal = true,
                SalonId = null,
                CreatedAt = DateTime.UtcNow
            };
        }

        /// <summary>Кастомна категорія салону</summary>
        public static SpecializationCategory CreateForSalon(Guid salonId, string name, string? description = null, string? iconUrl = null)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Category name is required.");

            return new SpecializationCategory
            {
                Id = Guid.NewGuid(),
                Name = name.Trim(),
                Description = description?.Trim(),
                IconUrl = iconUrl,
                IsGlobal = false,
                SalonId = salonId,
                CreatedAt = DateTime.UtcNow
            };
        }

        public void Update(string name, string? description, string? iconUrl)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Category name is required.");

            Name = name.Trim();
            Description = description?.Trim();
            IconUrl = iconUrl;
        }

        public void Deactivate() => IsActive = false;
        public void Activate() => IsActive = true;

        /// <summary>Перевірка що кастомна категорія належить цьому салону</summary>
        public void EnsureSalonAccess(Guid salonId)
        {
            if (IsGlobal) return; // глобальні доступні всім
            if (SalonId != salonId)
                throw new UnauthorizedAccessException("This category does not belong to your salon.");
        }
    }
}
