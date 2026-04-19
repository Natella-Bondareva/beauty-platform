using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    /// <summary>
    /// Шаблон послуги що автоматично прив'язується до майстра
    /// при створенні в конкретній категорії.
    /// Наприклад: "Nail Master" → ["Манікюр без покриття", "Манікюр з покриттям", ...]
    /// </summary>
    public class CategoryDefaultService
    {
        public Guid Id { get; private set; }
        public Guid CategoryId { get; private set; }
        public string Name { get; private set; } = default!;
        public string? Description { get; private set; }

        /// <summary>Скільки часу блокується в системі (з підготовкою)</summary>
        public int SystemDurationMinutes { get; private set; }

        /// <summary>Скільки часу показується клієнту</summary>
        public int ClientDurationMinutes { get; private set; }

        /// <summary>Рекомендована ціна (можна змінити при реальній послузі)</summary>
        public decimal SuggestedPrice { get; private set; }

        public int SortOrder { get; private set; }

        // Navigation
        public SpecializationCategory Category { get; private set; } = default!;

        private CategoryDefaultService() { } // EF Core

        public static CategoryDefaultService Create(
            Guid categoryId,
            string name,
            int systemDurationMinutes,
            int clientDurationMinutes,
            decimal suggestedPrice,
            string? description = null,
            int sortOrder = 0)
        {
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Service name is required.");
            if (systemDurationMinutes < 15)
                throw new ArgumentException("System duration must be at least 15 minutes.");
            if (clientDurationMinutes < 15)
                throw new ArgumentException("Client duration must be at least 15 minutes.");
            if (clientDurationMinutes > systemDurationMinutes)
                throw new ArgumentException("Client duration cannot exceed system duration.");
            if (suggestedPrice < 0)
                throw new ArgumentException("Price cannot be negative.");

            return new CategoryDefaultService
            {
                Id = Guid.NewGuid(),
                CategoryId = categoryId,
                Name = name.Trim(),
                Description = description?.Trim(),
                SystemDurationMinutes = systemDurationMinutes,
                ClientDurationMinutes = clientDurationMinutes,
                SuggestedPrice = suggestedPrice,
                SortOrder = sortOrder
            };
        }
    }
}