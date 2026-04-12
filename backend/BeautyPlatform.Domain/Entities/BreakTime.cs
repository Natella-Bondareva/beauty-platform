using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    public class BreakTime
    {
        public TimeSpan Start { get; private set; }
        public TimeSpan End { get; private set; }

        private BreakTime() { }

        public BreakTime(TimeSpan start, TimeSpan end)
        {
            if (start >= end)
                throw new ArgumentException("Invalid break time");

            Start = start;
            End = end;
        }
    }
}
