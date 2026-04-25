using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Application.Features.Scheduling.Interfaces;
using Hangfire;
using Microsoft.Extensions.Logging;

namespace CRMService.Infrastructure.Jobs
{
    public class BookingJobsService
    {
        private readonly IBookingRepository _bookingRepo;
        private readonly IClientRepository _clientRepo;
        private readonly IAvailableSlotsService _slotsService;
        private readonly ILogger<BookingJobsService> _logger;

        public BookingJobsService(
            IBookingRepository bookingRepo,
            IClientRepository clientRepo,
            IAvailableSlotsService slotsService,
            ILogger<BookingJobsService> logger)
        {
            _bookingRepo = bookingRepo;
            _clientRepo = clientRepo;
            _slotsService = slotsService;
            _logger = logger;
        }

        /// <summary>
        /// Очищення протермінованих PENDING бронювань.
        /// Запускається кожні 5 хвилин.
        /// </summary>
        [AutomaticRetry(Attempts = 3)]
        public async Task ExpirePendingBookingsAsync()
        {
            var expired = await _bookingRepo.GetExpiredPendingAsync();

            if (!expired.Any()) return;

            _logger.LogInformation("Expiring {Count} pending bookings.", expired.Count);

            foreach (var booking in expired)
            {
                try
                {
                    booking.ExpirePending();
                    await _bookingRepo.UpdateAsync(booking);

                    // Інвалідуємо кеш — слот знову вільний
                    var date = DateOnly.FromDateTime(booking.StartTimeUtc);
                    await _slotsService.InvalidateCacheAsync(
                        booking.SalonId, booking.ServiceId, date);
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to expire booking {BookingId}.", booking.Id);
                }
            }
        }

        /// <summary>
        /// Позначення підтверджених бронювань як NO_SHOW.
        /// Запускається кожні 15 хвилин.
        /// </summary>
        [AutomaticRetry(Attempts = 3)]
        public async Task MarkNoShowBookingsAsync()
        {
            var noShows = await _bookingRepo.GetConfirmedNoShowsAsync();

            if (!noShows.Any()) return;

            _logger.LogInformation("Marking {Count} bookings as no-show.", noShows.Count);

            foreach (var booking in noShows)
            {
                try
                {
                    booking.MarkAsNoShow();
                    await _bookingRepo.UpdateAsync(booking);

                    // Збільшуємо лічильник no-show клієнта
                    var client = await _clientRepo.GetByIdAsync(booking.ClientId);
                    if (client is not null)
                    {
                        client.IncrementNoShow();
                        await _clientRepo.UpdateAsync(client);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Failed to mark no-show for booking {BookingId}.", booking.Id);
                }
            }
        }
    }

    /// <summary>
    /// Реєстрація recurring jobs при старті застосунку
    /// </summary>
    public static class BookingJobsRegistration
    {
        public static void RegisterRecurringJobs()
        {
            // Кожні 5 хвилин — очищення PENDING
            RecurringJob.AddOrUpdate<BookingJobsService>(
                "expire-pending-bookings",
                x => x.ExpirePendingBookingsAsync(),
                "*/5 * * * *");

            // Кожні 15 хвилин — перевірка NO_SHOW
            RecurringJob.AddOrUpdate<BookingJobsService>(
                "mark-no-show-bookings",
                x => x.MarkNoShowBookingsAsync(),
                "*/15 * * * *");
        }
    }
}