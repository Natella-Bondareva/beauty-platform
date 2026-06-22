using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Application.Features.Scheduling.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;
using CRMService.Infrastructure.Jobs;
using FluentAssertions;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Time.Testing;
using Moq;

namespace CRMService.Tests.Unit.ExpirePendingBookings;

public class HangfireJobTests
{
    // Fixed reference point in the past so booking timestamps built from it
    // are always behind the real clock — entity validation (which uses DateTime.UtcNow)
    // will always pass without needing to control the system clock.
    private static readonly DateTimeOffset FakeNowOffset =
        new(2025, 1, 15, 10, 0, 0, TimeSpan.Zero);

    private readonly FakeTimeProvider _fakeTime;
    private readonly Mock<IBookingRepository> _bookingRepo;
    private readonly Mock<IClientRepository> _clientRepo;
    private readonly Mock<IAvailableSlotsService> _slotsService;
    private readonly BookingJobsService _sut;

    public HangfireJobTests()
    {
        _fakeTime = new FakeTimeProvider();
        _fakeTime.SetUtcNow(FakeNowOffset);

        _bookingRepo  = new Mock<IBookingRepository>();
        _clientRepo   = new Mock<IClientRepository>();
        _slotsService = new Mock<IAvailableSlotsService>();

        _sut = new BookingJobsService(
            _bookingRepo.Object,
            _clientRepo.Object,
            _slotsService.Object,
            NullLogger<BookingJobsService>.Instance);
    }

    // ── ExpirePendingBookingsAsync ───────────────────────────────────────────────

    [Fact]
    public async Task ExpirePendingBookings_WhenExpiredPendingExists_ShouldCancelAndInvalidateCache()
    {
        // Arrange — TTL вийшов 1 хвилину тому за фейковим часом
        var now = _fakeTime.GetUtcNow().UtcDateTime;
        var booking = BuildPendingBooking(
            expiresAt: now.AddMinutes(-1),
            startTime: now.AddHours(2));

        _bookingRepo.Setup(r => r.GetExpiredPendingAsync())
            .ReturnsAsync([booking]);
        _bookingRepo.Setup(r => r.UpdateAsync(It.IsAny<Booking>()))
            .Returns(Task.CompletedTask);
        _slotsService.Setup(s => s.InvalidateCacheAsync(
                It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<DateOnly>()))
            .Returns(Task.CompletedTask);

        // Act
        await _sut.ExpirePendingBookingsAsync();

        // Assert
        booking.Status.Should().Be(BookingStatus.Cancelled);
        booking.CancellationReason.Should().NotBeNullOrEmpty();

        _bookingRepo.Verify(r => r.UpdateAsync(booking), Times.Once);
        _slotsService.Verify(
            s => s.InvalidateCacheAsync(
                booking.SalonId,
                booking.ServiceId,
                DateOnly.FromDateTime(booking.StartTimeUtc)),
            Times.Once);
    }

    [Fact]
    public async Task ExpirePendingBookings_WhenNoExpiredBookings_ShouldNotCallUpdateOrInvalidate()
    {
        // Arrange
        _bookingRepo.Setup(r => r.GetExpiredPendingAsync())
            .ReturnsAsync([]);

        // Act
        await _sut.ExpirePendingBookingsAsync();

        // Assert
        _bookingRepo.Verify(r => r.UpdateAsync(It.IsAny<Booking>()), Times.Never);
        _slotsService.Verify(
            s => s.InvalidateCacheAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<DateOnly>()),
            Times.Never);
    }

    [Fact]
    public async Task ExpirePendingBookings_WhenMultipleExpired_ShouldExpireAllAndInvalidateEachCache()
    {
        // Arrange — симулюємо: TTL закінчився 3 хв та 1 хв тому
        var now = _fakeTime.GetUtcNow().UtcDateTime;
        var b1 = BuildPendingBooking(expiresAt: now.AddMinutes(-3), startTime: now.AddHours(1));
        var b2 = BuildPendingBooking(expiresAt: now.AddMinutes(-1), startTime: now.AddHours(3));

        _bookingRepo.Setup(r => r.GetExpiredPendingAsync())
            .ReturnsAsync([b1, b2]);
        _bookingRepo.Setup(r => r.UpdateAsync(It.IsAny<Booking>()))
            .Returns(Task.CompletedTask);
        _slotsService.Setup(s => s.InvalidateCacheAsync(
                It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<DateOnly>()))
            .Returns(Task.CompletedTask);

        // Act
        await _sut.ExpirePendingBookingsAsync();

        // Assert
        new[] { b1, b2 }.Should()
            .AllSatisfy(b => b.Status.Should().Be(BookingStatus.Cancelled));

        _bookingRepo.Verify(r => r.UpdateAsync(It.IsAny<Booking>()), Times.Exactly(2));
        _slotsService.Verify(
            s => s.InvalidateCacheAsync(It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<DateOnly>()),
            Times.Exactly(2));
    }

    [Fact]
    public async Task ExpirePendingBookings_WhenUpdateThrows_ShouldContinueWithRemainingBookings()
    {
        // Arrange — перший UpdateAsync кидає виняток; другий запис має все одно обробитись
        var now = _fakeTime.GetUtcNow().UtcDateTime;

        // Симулюємо: спочатку TTL 5 хв, потім просуваємо час на 6 хв → обидва протерміновані
        var b1 = BuildPendingBooking(expiresAt: now.AddMinutes(-5), startTime: now.AddHours(1));
        var b2 = BuildPendingBooking(expiresAt: now.AddMinutes(-1), startTime: now.AddHours(2));
        _fakeTime.Advance(TimeSpan.FromMinutes(6));

        _bookingRepo.Setup(r => r.GetExpiredPendingAsync())
            .ReturnsAsync([b1, b2]);
        _bookingRepo.SetupSequence(r => r.UpdateAsync(It.IsAny<Booking>()))
            .ThrowsAsync(new Exception("transient DB error"))
            .Returns(Task.CompletedTask);
        _slotsService.Setup(s => s.InvalidateCacheAsync(
                It.IsAny<Guid>(), It.IsAny<Guid>(), It.IsAny<DateOnly>()))
            .Returns(Task.CompletedTask);

        // Act — не має пробрасувати виняток назовні
        var act = () => _sut.ExpirePendingBookingsAsync();
        await act.Should().NotThrowAsync();

        // Assert — другий запис оброблений попри помилку на першому
        b2.Status.Should().Be(BookingStatus.Cancelled);
    }

    // ── MarkNoShowBookingsAsync ──────────────────────────────────────────────────

    [Fact]
    public async Task MarkNoShow_WhenConfirmedBookingPastEndTime_ShouldMarkNoShowAndIncrementClient()
    {
        // Arrange — запис завершився 1 годину тому
        var now = _fakeTime.GetUtcNow().UtcDateTime;
        var booking = BuildConfirmedBooking(endTime: now.AddHours(-1));
        var client  = new Client(booking.SalonId, "+380501234567");

        _bookingRepo.Setup(r => r.GetConfirmedNoShowsAsync())
            .ReturnsAsync([booking]);
        _bookingRepo.Setup(r => r.UpdateAsync(It.IsAny<Booking>()))
            .Returns(Task.CompletedTask);
        _clientRepo.Setup(r => r.GetByIdAsync(booking.ClientId))
            .ReturnsAsync(client);
        _clientRepo.Setup(r => r.UpdateAsync(It.IsAny<Client>()))
            .Returns(Task.CompletedTask);

        // Act
        await _sut.MarkNoShowBookingsAsync();

        // Assert
        booking.Status.Should().Be(BookingStatus.NoShow);
        client.NoShowCount.Should().Be(1);

        _bookingRepo.Verify(r => r.UpdateAsync(booking), Times.Once);
        _clientRepo.Verify(r => r.UpdateAsync(client), Times.Once);
    }

    [Fact]
    public async Task MarkNoShow_WhenNoConfirmedNoShows_ShouldNotCallUpdate()
    {
        // Arrange
        _bookingRepo.Setup(r => r.GetConfirmedNoShowsAsync())
            .ReturnsAsync([]);

        // Act
        await _sut.MarkNoShowBookingsAsync();

        // Assert
        _bookingRepo.Verify(r => r.UpdateAsync(It.IsAny<Booking>()), Times.Never);
        _clientRepo.Verify(r => r.UpdateAsync(It.IsAny<Client>()), Times.Never);
    }

    [Fact]
    public async Task MarkNoShow_WhenClientNotFound_ShouldStillMarkBookingAsNoShow()
    {
        // Arrange
        var now = _fakeTime.GetUtcNow().UtcDateTime;
        var booking = BuildConfirmedBooking(endTime: now.AddHours(-1));

        _bookingRepo.Setup(r => r.GetConfirmedNoShowsAsync())
            .ReturnsAsync([booking]);
        _bookingRepo.Setup(r => r.UpdateAsync(It.IsAny<Booking>()))
            .Returns(Task.CompletedTask);
        _clientRepo.Setup(r => r.GetByIdAsync(It.IsAny<Guid>()))
            .ReturnsAsync((Client?)null);

        // Act
        await _sut.MarkNoShowBookingsAsync();

        // Assert — запис позначено, клієнт не оновлювався
        booking.Status.Should().Be(BookingStatus.NoShow);
        _bookingRepo.Verify(r => r.UpdateAsync(booking), Times.Once);
        _clientRepo.Verify(r => r.UpdateAsync(It.IsAny<Client>()), Times.Never);
    }

    [Fact]
    public async Task MarkNoShow_WhenMultipleNoShows_ShouldMarkAllAndIncrementEachClient()
    {
        // Arrange
        var now = _fakeTime.GetUtcNow().UtcDateTime;
        var b1 = BuildConfirmedBooking(endTime: now.AddHours(-2));
        var b2 = BuildConfirmedBooking(endTime: now.AddHours(-1));
        var c1 = new Client(b1.SalonId, "+380501111111");
        var c2 = new Client(b2.SalonId, "+380502222222");

        _bookingRepo.Setup(r => r.GetConfirmedNoShowsAsync())
            .ReturnsAsync([b1, b2]);
        _bookingRepo.Setup(r => r.UpdateAsync(It.IsAny<Booking>()))
            .Returns(Task.CompletedTask);
        _clientRepo.Setup(r => r.GetByIdAsync(b1.ClientId)).ReturnsAsync(c1);
        _clientRepo.Setup(r => r.GetByIdAsync(b2.ClientId)).ReturnsAsync(c2);
        _clientRepo.Setup(r => r.UpdateAsync(It.IsAny<Client>()))
            .Returns(Task.CompletedTask);

        // Act
        await _sut.MarkNoShowBookingsAsync();

        // Assert
        new[] { b1, b2 }.Should()
            .AllSatisfy(b => b.Status.Should().Be(BookingStatus.NoShow));
        c1.NoShowCount.Should().Be(1);
        c2.NoShowCount.Should().Be(1);

        _bookingRepo.Verify(r => r.UpdateAsync(It.IsAny<Booking>()), Times.Exactly(2));
        _clientRepo.Verify(r => r.UpdateAsync(It.IsAny<Client>()), Times.Exactly(2));
    }

    [Fact]
    public async Task MarkNoShow_WhenBookingUpdateThrows_ShouldContinueWithRemainingBookings()
    {
        // Arrange
        var now = _fakeTime.GetUtcNow().UtcDateTime;
        var b1 = BuildConfirmedBooking(endTime: now.AddHours(-3));
        var b2 = BuildConfirmedBooking(endTime: now.AddHours(-1));
        var c2 = new Client(b2.SalonId, "+380503333333");

        _bookingRepo.Setup(r => r.GetConfirmedNoShowsAsync())
            .ReturnsAsync([b1, b2]);
        _bookingRepo.SetupSequence(r => r.UpdateAsync(It.IsAny<Booking>()))
            .ThrowsAsync(new Exception("transient DB error"))
            .Returns(Task.CompletedTask);
        _clientRepo.Setup(r => r.GetByIdAsync(b2.ClientId)).ReturnsAsync(c2);
        _clientRepo.Setup(r => r.UpdateAsync(It.IsAny<Client>()))
            .Returns(Task.CompletedTask);

        // Act — не має пробрасувати виняток
        var act = () => _sut.MarkNoShowBookingsAsync();
        await act.Should().NotThrowAsync();

        // Assert — другий запис оброблено попри помилку на першому
        b2.Status.Should().Be(BookingStatus.NoShow);
        c2.NoShowCount.Should().Be(1);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────────

    // expiresAt та startTime передаються відносно фейкового "зараз" (2025-01-15),
    // тому вони гарантовано у минулому відносно реального годинника.
    private static Booking BuildPendingBooking(DateTime expiresAt, DateTime startTime) =>
        Booking.CreatePending(
            salonId:      Guid.NewGuid(),
            clientId:     Guid.NewGuid(),
            employeeId:   Guid.NewGuid(),
            serviceId:    Guid.NewGuid(),
            startTimeUtc: startTime,
            endTimeUtc:   startTime.AddHours(1),
            price:        300m,
            expiresAt:    expiresAt);

    // endTime передається у минулому (відносно фейкового "зараз" = 2025-01-15),
    // тому entity-перевірка MarkAsNoShow() (DateTime.UtcNow < EndTimeUtc) завжди проходить.
    private static Booking BuildConfirmedBooking(DateTime endTime) =>
        Booking.CreateByAdmin(
            salonId:      Guid.NewGuid(),
            clientId:     Guid.NewGuid(),
            employeeId:   Guid.NewGuid(),
            serviceId:    Guid.NewGuid(),
            startTimeUtc: endTime.AddHours(-1),
            endTimeUtc:   endTime,
            price:        300m);
}
