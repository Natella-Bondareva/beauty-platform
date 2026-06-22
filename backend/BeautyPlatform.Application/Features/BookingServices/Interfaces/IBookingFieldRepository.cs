using CRMService.Application.Features.BookingServices.Commands;
using CRMService.Application.Features.BookingServices.DTOs;
using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Interfaces
{
    public interface IBookingFieldRepository
    {
        Task<List<BookingField>> GetBySalonIdAsync(Guid salonId);
        Task<BookingField?> GetByIdAsync(Guid id);
        Task AddAsync(BookingField field);
        Task UpdateAsync(BookingField field);
    }
}
