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
        Task<BookingDto> CreateByAdminAsync(CreateAdminBookingCommand command, Guid salonId, Guid ownerId);

        // ── Master cabinet ────────────────────────────────────────────
        /// <summary>Записи майстра — авторизовано за userId, не ownerId.</summary>
        Task<List<MasterBookingDto>> GetMyBookingsAsync(
            Guid salonId, Guid userId,
            DateOnly? date, DateOnly? dateFrom, DateOnly? dateTo);

        /// <summary>Завершення запису — знаходить employee по userId, перевіряє ownership.</summary>
        Task CompleteByEmployeeAsync(Guid bookingId, Guid userId);

        // ── Client self-service (public, SMS-verified) ─────────────────────
        /// <summary>Надсилає SMS-код на телефон клієнта для перегляду історії.</summary>
        Task RequestClientCodeAsync(string phone);

        /// <summary>Перевіряє код і повертає список записів клієнта у салоні.</summary>
        Task<List<BookingListItemDto>> GetClientHistoryAsync(Guid salonId, string phone, string code);

        /// <summary>Клієнт скасовує власний запис. Верифікація через phone+code.</summary>
        Task CancelByClientAsync(Guid bookingId, string phone, string code);
    }
}
