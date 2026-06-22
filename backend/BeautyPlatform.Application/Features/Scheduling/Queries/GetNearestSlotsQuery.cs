namespace CRMService.Application.Features.Scheduling.Queries
{
    public record GetNearestSlotsQuery(
        Guid SalonId,
        Guid ServiceId,
        int HorizonDays = 14);
}
