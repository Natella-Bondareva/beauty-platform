using CRMService.Application.Features.BookingServices.Commands;
using CRMService.Application.Features.BookingServices.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Interfaces
{
    public interface IBookingFieldService
    {
        Task<List<BookingFieldDto>> GetBySalonAsync(Guid salonId, Guid ownerId);

        // Клієнт при записі — отримує всі релевантні поля
        Task<List<BookingFieldDto>> GetForBookingAsync(
            Guid salonId,
            Guid? serviceId,
            Guid? masterId);

        Task<Guid> CreateAsync(Guid salonId, CreateBookingFieldCommand command, Guid ownerId);
        Task UpdateAsync(Guid fieldId, UpdateBookingFieldCommand command, Guid ownerId);
        Task DeleteAsync(Guid fieldId, Guid ownerId);
    }
}
