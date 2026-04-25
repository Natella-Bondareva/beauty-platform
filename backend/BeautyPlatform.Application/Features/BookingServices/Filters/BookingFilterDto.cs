using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Filters
{
    public class BookingFilterDto
    {
        public DateOnly? Date { get; set; }
        public Guid? EmployeeId { get; set; }
        public BookingStatus? Status { get; set; }
    }
}
