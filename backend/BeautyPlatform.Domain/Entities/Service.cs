using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
        public class Service
        {
            public Guid Id { get; private set; }
            public Guid SalonId { get; private set; }

            /// <summary>
            /// FK до SpecializationCategory.
            /// Замінює старий string Category.
            /// </summary>
            public Guid CategoryId { get; private set; }

            public string Name { get; private set; } = default!;
            public string? Description { get; private set; }
            public int SystemDurationMinutes { get; private set; }
            public int ClientDurationMinutes { get; private set; }
            public decimal Price { get; private set; }
            public bool IsActive { get; private set; } = true;
            public DateTime CreatedAt { get; private set; }

            // Navigation
            public Salon Salon { get; private set; } = default!;
            public SpecializationCategory Category { get; private set; } = default!;

            private readonly List<ServiceImage> _images = new();
            public IReadOnlyCollection<ServiceImage> Images => _images.AsReadOnly();

            private readonly List<EmployeeService> _employeeServices = new();
            public IReadOnlyCollection<EmployeeService> EmployeeServices => _employeeServices.AsReadOnly();

            private Service() { }

            public Service(
                Guid salonId,
                Guid categoryId,
                string name,
                int systemDurationMinutes,
                int clientDurationMinutes,
                decimal price,
                string? description = null)
            {
                Id = Guid.NewGuid();
                SalonId = salonId;
                CategoryId = categoryId;
                CreatedAt = DateTime.UtcNow;

                SetName(name);
                SetDurations(systemDurationMinutes, clientDurationMinutes);
                SetPrice(price);
                Description = description?.Trim();
            }

            public void Update(
                Guid categoryId,
                string name,
                int systemDurationMinutes,
                int clientDurationMinutes,
                decimal price,
                string? description)
            {
                CategoryId = categoryId;
                SetName(name);
                SetDurations(systemDurationMinutes, clientDurationMinutes);
                SetPrice(price);
                Description = description?.Trim();
            }

            public void AddImage(string imageUrl, bool isCover = false)
            {
                if (string.IsNullOrWhiteSpace(imageUrl))
                    throw new ArgumentException("Image URL is required.");

                if (isCover)
                    foreach (var img in _images)
                        img.SetCover(false);

                var shouldBeCover = isCover || !_images.Any();
                _images.Add(new ServiceImage(Id, imageUrl, shouldBeCover, _images.Count));
            }

            public void RemoveImage(Guid imageId)
            {
                var image = _images.FirstOrDefault(x => x.Id == imageId)
                    ?? throw new KeyNotFoundException($"Image {imageId} not found.");

                var wasCover = image.IsCover;
                _images.Remove(image);

                if (wasCover && _images.Any())
                    _images.First().SetCover(true);
            }

            public void Deactivate() => IsActive = false;
            public void Activate() => IsActive = true;

            public void EnsureBelongsToSalon(Guid salonId)
            {
                if (SalonId != salonId)
                    throw new UnauthorizedAccessException("Service does not belong to this salon.");
            }

            private void SetName(string name)
            {
                if (string.IsNullOrWhiteSpace(name))
                    throw new ArgumentException("Service name is required.");
                Name = name.Trim();
            }

            private void SetDurations(int systemMinutes, int clientMinutes)
            {
                if (systemMinutes < 15)
                    throw new ArgumentException("System duration must be at least 15 minutes.");
                if (clientMinutes < 15)
                    throw new ArgumentException("Client duration must be at least 15 minutes.");
                if (clientMinutes > systemMinutes)
                    throw new ArgumentException("Client duration cannot exceed system duration.");

                SystemDurationMinutes = systemMinutes;
                ClientDurationMinutes = clientMinutes;
            }

            private void SetPrice(decimal price)
            {
                if (price < 0)
                    throw new ArgumentException("Price cannot be negative.");
                Price = price;
            }
        }
    }

