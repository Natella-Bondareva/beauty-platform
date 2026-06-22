using CRMService.Application.Features.BookingServices.Responses;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;
using CRMService.Infrastructure.Persistence;
using FluentAssertions;
using Microsoft.Extensions.DependencyInjection;
using System.Net;
using System.Net.Http.Json;

namespace CRMService.Tests.Integration
{
    public class BookingApiTests : IntegrationTestBase
    {
        // IDs сутностей, засіяних перед кожним тестом
        private Guid _salonId;
        private Guid _serviceId;
        private Guid _employeeId;
        private Guid _ownerId;

        // Перевизначаємо InitializeAsync, щоб засіяти тестові дані
        // після того як base запустив міграції
        public override async Task InitializeAsync()
        {
            await base.InitializeAsync();
            await SeedAsync();
        }

        private async Task SeedAsync()
        {
            await using var scope = CreateDbScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            var role  = Role.Create("Admin");
            await db.Roles.AddAsync(role);

            var user = User.Create("owner@test.com", "hash", "Test", "Owner", role.Id);
            await db.Users.AddAsync(user);
            _ownerId = user.Id;

            var salon = new Salon(_ownerId, "Test Salon", "+380501234567",
                new Address("Main St 1", "Kyiv"));
            await db.Salons.AddAsync(salon);
            _salonId = salon.Id;

            var category = SpecializationCategory.CreateGlobal("Haircut");
            await db.SpecializationCategories.AddAsync(category);

            var service = new Service(_salonId, category.Id, "Classic Haircut",
                systemDurationMinutes: 60,
                clientDurationMinutes: 60,
                price: 300m);
            await db.Services.AddAsync(service);
            _serviceId = service.Id;

            var employee = new Employee(_salonId, "Jane Smith", "+380507654321",
                hireDate: DateTime.UtcNow.AddYears(-1));
            await db.Employees.AddAsync(employee);
            _employeeId = employee.Id;

            // Прив'язуємо майстра до послуги
            await db.EmployeeServices.AddAsync(new EmployeeService(_employeeId, _serviceId));

            await db.SaveChangesAsync();
        }

        // ── Happy path ──────────────────────────────────────────────

        [Fact]
        public async Task Create_ValidRequest_Returns200WithPendingStatus()
        {
            // Arrange
            // Бронювання на завтра о 10:00 UTC — завжди > 15 хвилин від "зараз"
            var startTime = DateTime.UtcNow.Date.AddDays(1).AddHours(10);

            var payload = new
            {
                serviceId       = _serviceId,
                employeeId      = _employeeId,
                startTimeUtc    = startTime,
                clientPhone     = "+380501111111",
                clientFirstName = "Тест",
                clientLastName  = "Клієнт"
            };

            // Act
            var response = await Client.PostAsJsonAsync(
                $"/api/salons/{_salonId}/bookings", payload);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.OK);

            var body = await response.Content.ReadFromJsonAsync<CreateBookingResponse>();
            body!.BookingId.Should().NotBe(Guid.Empty);
            body.Status.Should().Be(BookingStatus.Pending);
            body.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
            body.AttemptsAllowed.Should().BeGreaterThan(0);
        }

        // ── Conflict ────────────────────────────────────────────────

        [Fact]
        public async Task Create_SlotAlreadyTaken_Returns409()
        {
            // Arrange — обидва записи на той самий слот (майстер + час)
            var startTime = DateTime.UtcNow.Date.AddDays(1).AddHours(14); // 14:00 UTC завтра

            var payload = new
            {
                serviceId    = _serviceId,
                employeeId   = _employeeId,
                startTimeUtc = startTime,
                clientPhone  = "+380502222222",
            };

            // Перший запис займає слот — має успішно створитись
            var first = await Client.PostAsJsonAsync($"/api/salons/{_salonId}/bookings", payload);
            first.StatusCode.Should().Be(HttpStatusCode.OK,
                because: "перший запис повинен успішно створитись");

            // Act — другий запис на той самий слот
            var second = await Client.PostAsJsonAsync($"/api/salons/{_salonId}/bookings", payload);

            // Assert
            second.StatusCode.Should().Be(HttpStatusCode.Conflict); // 409
        }

        // ── Not Found ───────────────────────────────────────────────

        [Fact]
        public async Task Create_NonExistentSalon_Returns404()
        {
            // Arrange
            var payload = new
            {
                serviceId    = _serviceId,
                employeeId   = _employeeId,
                startTimeUtc = DateTime.UtcNow.Date.AddDays(1).AddHours(12),
                clientPhone  = "+380503333333"
            };

            // Act — передаємо випадковий salonId якого не існує
            var response = await Client.PostAsJsonAsync(
                $"/api/salons/{Guid.NewGuid()}/bookings", payload);

            // Assert
            response.StatusCode.Should().Be(HttpStatusCode.NotFound); // 404
        }

        // ── Authorized endpoint ─────────────────────────────────────

        [Fact]
        public async Task GetBySalon_WithoutToken_Returns401()
        {
            ClearAuthToken();

            var response = await Client.GetAsync($"/api/salons/{_salonId}/bookings");

            response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        [Fact]
        public async Task GetBySalon_WithValidToken_Returns200()
        {
            SetAuthToken(_ownerId, "Admin");

            var response = await Client.GetAsync($"/api/salons/{_salonId}/bookings");

            response.StatusCode.Should().Be(HttpStatusCode.OK);
        }
    }
}
