using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Scheduling.DTOs
{
    public class SlotTimeDto
    {
        public DateTime StartTimeUtc { get; set; }
        public DateTime EndTimeUtc { get; set; }
        public string StartTimeLocal { get; set; } = default!;
        public string EndTimeLocal { get; set; } = default!;
    }
}
