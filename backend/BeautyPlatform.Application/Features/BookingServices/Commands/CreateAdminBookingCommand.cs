namespace CRMService.Application.Features.BookingServices.Commands
{
    public record CreateAdminBookingCommand(
        Guid ServiceId,
        Guid EmployeeId,
        DateTime StartTimeUtc,
        string ClientPhone,
        string? ClientFirstName,
        string? ClientLastName,
        string? Notes
    );
}
