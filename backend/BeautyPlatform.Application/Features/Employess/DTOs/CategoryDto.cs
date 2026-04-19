using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.DTOs
{
    public class CategoryDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public string? Description { get; set; }
        public string? IconUrl { get; set; }
        public bool IsGlobal { get; set; }
        public List<CategoryDefaultServiceDto> DefaultServices { get; set; } = new();
    }

    public class CategoryDefaultServiceDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = default!;
        public int SystemDurationMinutes { get; set; }
        public int ClientDurationMinutes { get; set; }
        public decimal SuggestedPrice { get; set; }
    }
}
