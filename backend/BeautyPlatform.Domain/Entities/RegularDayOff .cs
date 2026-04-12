using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    public class RegularDayOff  // щотижневий вихідний
    {
        public Guid Id { get; private set; }
        public DayOfWeek DayOfWeek { get; private set; }

        private RegularDayOff() { }

        public RegularDayOff(DayOfWeek dayOfWeek)
        {
            Id = Guid.NewGuid();
            DayOfWeek = dayOfWeek;
        }
    }
}
