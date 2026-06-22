using CRMService.Domain.Enums;
using FluentAssertions;
using CRMService.Domain.Entities;

namespace CRMService.Tests.Unit.BookingAgregate
{
    public class BookingAggregateTests
    {
        // ── Constructor ────────────────────────────────────────────

        [Fact]
        public void Constructor_WhenStartAfterEnd_ShouldThrow()
        {
            var act = () => new Booking(
                Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
                startTimeUtc: DateTime.UtcNow.AddHours(3),
                endTimeUtc:   DateTime.UtcNow.AddHours(2),
                price: 100m);

            act.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void Constructor_WhenStartTooSoon_ShouldThrow()
        {
            var act = () => new Booking(
                Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
                startTimeUtc: DateTime.UtcNow.AddMinutes(10),
                endTimeUtc:   DateTime.UtcNow.AddMinutes(70),
                price: 100m);

            act.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void Constructor_ValidArgs_ShouldSetPendingStatusAndInitFields()
        {
            var booking = new Booking(
                Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
                startTimeUtc: DateTime.UtcNow.AddHours(2),
                endTimeUtc:   DateTime.UtcNow.AddHours(3),
                price: 150m);

            booking.Id.Should().NotBe(Guid.Empty);
            booking.Status.Should().Be(BookingStatus.Pending);
            booking.Price.Should().Be(150m);
            booking.ExpiresAt.Should().BeCloseTo(DateTime.UtcNow.AddMinutes(5), TimeSpan.FromSeconds(5));
            booking.CreatedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        // ── Confirm ────────────────────────────────────────────────

        [Fact]
        public void Confirm_WhenPendingAndNotExpired_ShouldSetConfirmedStatus()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(3));
            booking.Confirm();
            booking.Status.Should().Be(BookingStatus.Confirmed);
        }

        [Fact]
        public void Confirm_WhenPendingAndNotExpired_ShouldSetConfirmedAt()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(3));
            booking.Confirm();
            booking.ConfirmedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public void Confirm_WhenExpired_ShouldThrow()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(-1));
            var act = () => booking.Confirm();
            act.Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void Confirm_WhenAlreadyConfirmed_ShouldThrow()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(3));
            booking.Confirm();
            var act = () => booking.Confirm();
            act.Should().Throw<InvalidOperationException>();
        }

        // ── Cancel ────────────────────────────────────────────────

        [Fact]
        public void Cancel_WhenConfirmedMoreThan2HoursBefore_ShouldSetCancelledStatus()
        {
            var booking = CreateConfirmedBooking(startTime: DateTime.UtcNow.AddHours(4));
            booking.Cancel("client request");
            booking.Status.Should().Be(BookingStatus.Cancelled);
        }

        [Fact]
        public void Cancel_WhenSuccessful_ShouldTrimReasonAndSetCancelledAt()
        {
            var booking = CreateConfirmedBooking(startTime: DateTime.UtcNow.AddHours(4));
            booking.Cancel("  client request  ");
            booking.CancellationReason.Should().Be("client request");
            booking.CancelledAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public void Cancel_WhenConfirmedLessThan2HoursBefore_ShouldThrow()
        {
            var booking = CreateConfirmedBooking(startTime: DateTime.UtcNow.AddHours(1));
            var act = () => booking.Cancel("late");
            act.Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void Cancel_WhenPending_ShouldSucceedWithout2HourCheck()
        {
            // Pending-бронювання не підпадає під перевірку 2h буфера
            var booking = CreatePendingBooking(
                expiresAt: DateTime.UtcNow.AddMinutes(3),
                startTime: DateTime.UtcNow.AddMinutes(30));

            booking.Cancel("changed mind");

            booking.Status.Should().Be(BookingStatus.Cancelled);
        }

        [Fact]
        public void Cancel_WhenCompleted_ShouldThrow()
        {
            var booking = CreateConfirmedBooking();
            booking.Complete();
            var act = () => booking.Cancel("reason");
            act.Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void Cancel_WhenNoShow_ShouldThrow()
        {
            var booking = CreateConfirmedBooking(
                startTime: DateTime.UtcNow.AddHours(-2),
                endTime:   DateTime.UtcNow.AddHours(-1));
            booking.MarkAsNoShow();
            var act = () => booking.Cancel("reason");
            act.Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void Cancel_WhenAlreadyCancelled_ShouldThrow()
        {
            var booking = CreateConfirmedBooking(startTime: DateTime.UtcNow.AddHours(4));
            booking.Cancel("first");
            var act = () => booking.Cancel("second");
            act.Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void Cancel_WithEmptyReason_ShouldThrow()
        {
            var booking = CreateConfirmedBooking(startTime: DateTime.UtcNow.AddHours(4));
            var act = () => booking.Cancel("");
            act.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void Cancel_WithWhitespaceReason_ShouldThrow()
        {
            var booking = CreateConfirmedBooking(startTime: DateTime.UtcNow.AddHours(4));
            var act = () => booking.Cancel("   ");
            act.Should().Throw<ArgumentException>();
        }

        // ── Complete ───────────────────────────────────────────────

        [Fact]
        public void Complete_WhenConfirmed_ShouldSetCompletedStatus()
        {
            var booking = CreateConfirmedBooking();
            booking.Complete();
            booking.Status.Should().Be(BookingStatus.Completed);
        }

        [Fact]
        public void Complete_WhenConfirmed_ShouldSetCompletedAt()
        {
            var booking = CreateConfirmedBooking();
            booking.Complete();
            booking.CompletedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public void Complete_WhenPending_ShouldThrow()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(3));
            var act = () => booking.Complete();
            act.Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void Complete_WhenCancelled_ShouldThrow()
        {
            var booking = CreateConfirmedBooking(startTime: DateTime.UtcNow.AddHours(4));
            booking.Cancel("reason");
            var act = () => booking.Complete();
            act.Should().Throw<InvalidOperationException>();
        }

        // ── MarkAsNoShow ───────────────────────────────────────────

        [Fact]
        public void MarkAsNoShow_WhenConfirmedAndAfterEnd_ShouldSetNoShowStatus()
        {
            var booking = CreateConfirmedBooking(
                startTime: DateTime.UtcNow.AddHours(-2),
                endTime:   DateTime.UtcNow.AddHours(-1));
            booking.MarkAsNoShow();
            booking.Status.Should().Be(BookingStatus.NoShow);
        }

        [Fact]
        public void MarkAsNoShow_WhenBeforeEndTime_ShouldThrow()
        {
            var booking = CreateConfirmedBooking(
                startTime: DateTime.UtcNow.AddHours(1),
                endTime:   DateTime.UtcNow.AddHours(2));
            var act = () => booking.MarkAsNoShow();
            act.Should().Throw<InvalidOperationException>();
        }

        [Fact]
        public void MarkAsNoShow_WhenNotConfirmed_ShouldThrow()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(3));
            var act = () => booking.MarkAsNoShow();
            act.Should().Throw<InvalidOperationException>();
        }

        // ── ExpirePending ──────────────────────────────────────────

        [Fact]
        public void ExpirePending_WhenPending_ShouldSetCancelledStatus()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(-1));
            booking.ExpirePending();
            booking.Status.Should().Be(BookingStatus.Cancelled);
        }

        [Fact]
        public void ExpirePending_WhenPending_ShouldSetCancellationReasonAndTimestamp()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(-1));
            booking.ExpirePending();
            booking.CancellationReason.Should().NotBeNullOrEmpty();
            booking.CancelledAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public void ExpirePending_WhenNotPending_ShouldThrow()
        {
            var booking = CreateConfirmedBooking();
            var act = () => booking.ExpirePending();
            act.Should().Throw<InvalidOperationException>();
        }

        // ── IsExpired ──────────────────────────────────────────────

        [Fact]
        public void IsExpired_WhenPendingAndPastExpiry_ShouldBeTrue()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(-1));
            booking.IsExpired.Should().BeTrue();
        }

        [Fact]
        public void IsExpired_WhenPendingAndNotExpired_ShouldBeFalse()
        {
            var booking = CreatePendingBooking(expiresAt: DateTime.UtcNow.AddMinutes(3));
            booking.IsExpired.Should().BeFalse();
        }

        [Fact]
        public void IsExpired_WhenConfirmed_ShouldBeFalse()
        {
            var booking = CreateConfirmedBooking();
            booking.IsExpired.Should().BeFalse();
        }

        // ── CreateByAdmin ──────────────────────────────────────────

        [Fact]
        public void CreateByAdmin_ShouldCreateConfirmedBookingImmediately()
        {
            var booking = CreateConfirmedBooking();
            booking.Status.Should().Be(BookingStatus.Confirmed);
            booking.ConfirmedAt.Should().BeCloseTo(DateTime.UtcNow, TimeSpan.FromSeconds(5));
        }

        [Fact]
        public void CreateByAdmin_WhenStartAfterEnd_ShouldThrow()
        {
            var act = () => Booking.CreateByAdmin(
                Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
                startTimeUtc: DateTime.UtcNow.AddHours(3),
                endTimeUtc:   DateTime.UtcNow.AddHours(2),
                price: 100m);

            act.Should().Throw<ArgumentException>();
        }

        [Fact]
        public void CreateByAdmin_ShouldAllowPastStartTime()
        {
            // CreateByAdmin не має обмеження "15 хвилин в майбутньому"
            var booking = Booking.CreateByAdmin(
                Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(), Guid.NewGuid(),
                startTimeUtc: DateTime.UtcNow.AddHours(-2),
                endTimeUtc:   DateTime.UtcNow.AddHours(-1),
                price: 100m);

            booking.Status.Should().Be(BookingStatus.Confirmed);
        }

        // ── Helpers ────────────────────────────────────────────────

        private Booking CreatePendingBooking(DateTime expiresAt, DateTime? startTime = null)
        {
            var start = startTime ?? DateTime.UtcNow.AddHours(2);
            return Booking.CreatePending(
                salonId:      Guid.NewGuid(),
                clientId:     Guid.NewGuid(),
                employeeId:   Guid.NewGuid(),
                serviceId:    Guid.NewGuid(),
                startTimeUtc: start,
                endTimeUtc:   start.AddHours(1),
                price:        100m,
                expiresAt:    expiresAt);
        }

        private Booking CreateConfirmedBooking(DateTime? startTime = null, DateTime? endTime = null)
        {
            var start = startTime ?? DateTime.UtcNow.AddHours(3);
            var end   = endTime   ?? start.AddHours(1);
            return Booking.CreateByAdmin(
                salonId:      Guid.NewGuid(),
                clientId:     Guid.NewGuid(),
                employeeId:   Guid.NewGuid(),
                serviceId:    Guid.NewGuid(),
                startTimeUtc: start,
                endTimeUtc:   end,
                price:        100m);
        }
    }
}
