using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class SalonSettingsDto
    {
        public TimeSpan OpeningTime { get; set; }
        public TimeSpan ClosingTime { get; set; }
        public int DefaultSlotDurationMinutes { get; set; }
        public string Timezone { get; set; }
        public List<BreakTimeDto> BreakTimes { get; set; } = new();
        public List<RegularDayOffDto> RegularDaysOff { get; set; } = new();
        public List<SpecialDayOffDto> SpecialDaysOff { get; set; } = new();
    }

    public class RegularDayOffDto
    {
        public Guid Id { get; set; }
        public DayOfWeek DayOfWeek { get; set; }
    }

    public class SpecialDayOffDto
    {
        public Guid Id { get; set; }
        public DateTime Date { get; set; }
        public string? Reason { get; set; }
    }

    public class BreakTimeDto
    {
        public TimeSpan Start { get; set; }
        public TimeSpan End { get; set; }
    }
}
