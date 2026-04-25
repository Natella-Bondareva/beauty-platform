using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.DTOs
{
    public class EmployeeDto
    {
        public Guid Id { get; set; }
        public Guid SalonId { get; set; }
        public List<CategoryShortDto> Categories { get; set; } = new(); // ← було: одна CategoryName
        public string FullName { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public string? Email { get; set; }
        public string? AvatarUrl { get; set; }
        public DateTime HireDate { get; set; }
        public bool IsActive { get; set; }
        public bool HasUserAccount { get; set; }
        public List<EmployeeServiceDto> Services { get; set; } = new();
        public List<ScheduleDto> Schedule { get; set; } = new();
    }

    public class EmployeeListItemDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = default!;
        public string Phone { get; set; } = default!;
        public string? AvatarUrl { get; set; }
        public List<CategoryShortDto> Categories { get; set; } = new(); // ← список
        public bool IsActive { get; set; }
        public bool HasUserAccount { get; set; }
        public int ServicesCount { get; set; }
    }

    public class CategoryShortDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
    }

    public class EmployeeServiceDto
    {
        public Guid ServiceId { get; set; }
        public string ServiceName { get; set; } = default!;
        public string CategoryName { get; set; } = default!;

        // Базові значення послуги
        public decimal BasePrice { get; set; }
        public int BaseSystemDuration { get; set; }
        public int BaseClientDuration { get; set; }

        // Override цього майстра (null = використовує базові)
        public decimal? PriceOverride { get; set; }
        public int? SystemDurationOverride { get; set; }
        public int? ClientDurationOverride { get; set; }

        // Ефективні значення (override ?? base)
        public decimal EffectivePrice { get; set; }
        public int EffectiveSystemDuration { get; set; }
        public int EffectiveClientDuration { get; set; }
    }

    public class ScheduleDto
    {
        public DayOfWeek DayOfWeek { get; set; }
        public bool IsWorking { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
    }
}
