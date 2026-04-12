using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    public class SpecialDayOff  // разовий вихідний
    {
        public Guid Id { get; private set; }
        public DateTime Date { get; private set; }
        public string? Reason { get; private set; } // наприклад "Новий рік"

        private SpecialDayOff() { }

        public SpecialDayOff(DateTime date, string? reason)
        {
            Id = Guid.NewGuid();
            Date = DateTime.SpecifyKind(date, DateTimeKind.Utc); // фікс PostgreSQL
            Reason = reason;
        }
    }
}
