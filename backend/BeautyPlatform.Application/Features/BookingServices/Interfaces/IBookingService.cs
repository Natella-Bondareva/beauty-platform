using CRMService.Application.Features.BookingServices.Commands;
using CRMService.Application.Features.BookingServices.DTOs;
using CRMService.Application.Features.BookingServices.Filters;
using CRMService.Application.Features.BookingServices.Responses;

namespace CRMService.Application.Features.BookingServices.Interfaces
{
    public interface IBookingService
    {
        Task<CreateBookingResponse> CreateAsync(CreateBookingCommand command);
        Task<VerifyCodeResponse> VerifyCodeAsync(Guid bookingId, string code);
        Task CancelAsync(Guid bookingId, string reason, Guid requesterId);
        Task CompleteAsync(Guid bookingId, Guid employeeId);
        Task<BookingDto> GetByIdAsync(Guid bookingId);
        Task<List<BookingListItemDto>> GetBySalonAsync(Guid salonId, Guid ownerId, BookingFilterDto filter);
    }
}
