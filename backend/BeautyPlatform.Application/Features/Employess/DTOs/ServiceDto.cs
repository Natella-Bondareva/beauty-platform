using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.DTOs
{
    public class ServiceDto
    {
        public Guid Id { get; set; }
        public Guid SalonId { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = default!; 
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public int SystemDurationMinutes { get; set; }
        public int ClientDurationMinutes { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
        public List<ServiceImageDto> Images { get; set; } = new();
        public List<ServiceEmployeeDto> Employees { get; set; } = new();
    }

    public class ServiceListItemDto
    {
        public Guid Id { get; set; }
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = default!;
        public string Name { get; set; } = default!;
        public int SystemDurationMinutes { get; set; }
        public int ClientDurationMinutes { get; set; }
        public decimal Price { get; set; }
        public bool IsActive { get; set; }
        public string? CoverImageUrl { get; set; }
        public int EmployeesCount { get; set; }
    }

    public class ServiceImageDto
    {
        public Guid Id { get; set; }
        public string ImageUrl { get; set; } = default!;
        public bool IsCover { get; set; }
        public int SortOrder { get; set; }
    }

    public class ServiceEmployeeDto
    {
        public Guid EmployeeId { get; set; }
        public string FullName { get; set; } = default!;
        public string? AvatarUrl { get; set; }

        // Ефективні значення для цього майстра
        public decimal EffectivePrice { get; set; }
        public int EffectiveSystemDuration { get; set; }
        public int EffectiveClientDuration { get; set; }

        // Чи є override (для відображення в адміні)
        public decimal? PriceOverride { get; set; }
        public int? SystemDurationOverride { get; set; }
        public int? ClientDurationOverride { get; set; }
    }
}
