using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    public class SalonSettings
    {
        public Guid Id { get; private set; }
        public Guid SalonId { get; private set; }

        public TimeSpan OpeningTime { get; private set; }
        public TimeSpan ClosingTime { get; private set; }

        public int DefaultSlotDurationMinutes { get; private set; }

        public string Timezone { get; private set; }

        private readonly List<BreakTime> _breakTimes = new();
        public IReadOnlyCollection<BreakTime> BreakTimes => _breakTimes;

        private readonly List<RegularDayOff> _regularDaysOff = new();
        public IReadOnlyCollection<RegularDayOff> RegularDaysOff => _regularDaysOff;

        private readonly List<SpecialDayOff> _specialDaysOff = new();
        public IReadOnlyCollection<SpecialDayOff> SpecialDaysOff => _specialDaysOff;

        private SalonSettings() { }

        public SalonSettings(Guid salonId)
        {
            Id = Guid.NewGuid();
            SalonId = salonId;

            // Default values
            OpeningTime = new TimeSpan(9, 0, 0);
            ClosingTime = new TimeSpan(18, 0, 0);
            DefaultSlotDurationMinutes = 60;
            Timezone = "Europe/Kyiv";
        }

        public void UpdateWorkingHours(TimeSpan opening, TimeSpan closing)
        {
            if (opening >= closing)
                throw new ArgumentException("Opening time must be less than closing time");

            OpeningTime = opening;
            ClosingTime = closing;
        }

        public void SetSlotDuration(int minutes)
        {
            if (minutes <= 0)
                throw new ArgumentException("Duration must be greater than 0");

            DefaultSlotDurationMinutes = minutes;
        }

        public void AddBreak(TimeSpan start, TimeSpan end)
        {
            if (start >= end)
                throw new ArgumentException("Break start must be before end");

            _breakTimes.Add(new BreakTime(start, end));
        }

        // Регулярний вихідний — наприклад щопонеділка
        public void AddRegularDayOff(DayOfWeek dayOfWeek)
        {
            if (_regularDaysOff.Any(x => x.DayOfWeek == dayOfWeek))
                throw new InvalidOperationException($"{dayOfWeek} is already a day off.");
            _regularDaysOff.Add(new RegularDayOff(dayOfWeek));
        }

        public void RemoveRegularDayOff(DayOfWeek dayOfWeek)
        {
            var item = _regularDaysOff.FirstOrDefault(x => x.DayOfWeek == dayOfWeek)
                ?? throw new KeyNotFoundException($"{dayOfWeek} is not a regular day off.");
            _regularDaysOff.Remove(item);
        }

        // Разовий вихідний — конкретна дата
        public void AddSpecialDayOff(DateTime date, string? reason = null)
        {
            var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
            if (utcDate < DateTime.UtcNow.Date)
                throw new ArgumentException("Special day off must be in the future.");
            if (_specialDaysOff.Any(x => x.Date.Date == utcDate.Date))
                throw new InvalidOperationException("This date is already marked as day off.");
            _specialDaysOff.Add(new SpecialDayOff(utcDate, reason));
        }

        public void RemoveSpecialDayOff(Guid id)
        {
            var item = _specialDaysOff.FirstOrDefault(x => x.Id == id)
                ?? throw new KeyNotFoundException("Special day off not found.");
            _specialDaysOff.Remove(item);
        }

        // Перевірка чи салон працює в конкретну дату
        public bool IsWorkingDay(DateTime date)
        {
            var utcDate = DateTime.SpecifyKind(date.Date, DateTimeKind.Utc);
            var isRegularDayOff = _regularDaysOff.Any(x => x.DayOfWeek == utcDate.DayOfWeek);
            var isSpecialDayOff = _specialDaysOff.Any(x => x.Date.Date == utcDate.Date);
            return !isRegularDayOff && !isSpecialDayOff;
        }
    }
}
