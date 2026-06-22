using CRMService.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using Testcontainers.PostgreSql;

namespace CRMService.Tests.Integration
{
    public class IntegrationTestBase : IAsyncLifetime
    {
        // Тестові значення для JWT — рядок >= 32 символів щоб задовольнити вимоги HMAC-SHA256
        protected const string TestJwtSecret   = "super-secret-key-for-testing-only-32chars!";
        protected const string TestJwtIssuer   = "test-issuer";
        protected const string TestJwtAudience = "test-audience";

        private readonly PostgreSqlContainer _pg = new PostgreSqlBuilder()
            .WithImage("postgres:16-alpine")
            .Build();

        private WebApplicationFactory<Program> _factory = default!;

        protected HttpClient Client { get; private set; } = default!;

        // virtual — похідні класи можуть перевизначити для seeding після запуску міграцій
        public virtual async Task InitializeAsync()
        {
            await _pg.StartAsync();

            _factory = new WebApplicationFactory<Program>()
                .WithWebHostBuilder(b =>
                {
                    // ConfigureAppConfiguration виконується ДО реєстрації сервісів,
                    // тому і DbContext, і Hangfire читатимуть тестовий рядок підключення
                    b.ConfigureAppConfiguration((_, cfg) =>
                    {
                        cfg.AddInMemoryCollection(new Dictionary<string, string?>
                        {
                            ["ConnectionStrings:Default"] = _pg.GetConnectionString(),
                            // Redis недоступний — Program.cs має fallback на NoOpSlotCacheService
                            ["ConnectionStrings:Redis"]   = "localhost:6379,abortConnect=false",
                            ["JwtSettings:Secret"]        = TestJwtSecret,
                            ["JwtSettings:Issuer"]        = TestJwtIssuer,
                            ["JwtSettings:Audience"]      = TestJwtAudience,
                            // Cloudinary потребує непорожніх значень при старті
                            ["Cloudinary:CloudName"]      = "test-cloud",
                            ["Cloudinary:ApiKey"]         = "000000000000000",
                            ["Cloudinary:ApiSecret"]      = "test-secret",
                        });
                    });

                    // PostConfigure runs AFTER Program.cs registers JWT, so it reliably
                    // overrides the token validation parameters with the test values.
                    b.ConfigureServices(services =>
                    {
                        services.PostConfigure<JwtBearerOptions>(
                            JwtBearerDefaults.AuthenticationScheme, opts =>
                            {
                                var signingKey = new SymmetricSecurityKey(
                                    Encoding.UTF8.GetBytes(TestJwtSecret));
                                opts.TokenValidationParameters = new TokenValidationParameters
                                {
                                    ValidateIssuer           = true,
                                    ValidateAudience         = true,
                                    ValidateLifetime         = true,
                                    ValidateIssuerSigningKey = true,
                                    ValidIssuer              = TestJwtIssuer,
                                    ValidAudience            = TestJwtAudience,
                                    IssuerSigningKey         = signingKey,
                                };
                            });
                    });
                });

            Client = _factory.CreateClient();

            // Запускаємо міграції на тестовій БД
            await using var scope = _factory.Services.CreateAsyncScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            await db.Database.MigrateAsync();
        }

        public virtual async Task DisposeAsync()
        {
            await _factory.DisposeAsync();
            await _pg.DisposeAsync();
        }

        // Допоміжний метод для seeding через DI-скоп фабрики
        protected AsyncServiceScope CreateDbScope() =>
            _factory.Services.CreateAsyncScope();

        // Встановлює Bearer-токен для наступних запитів
        protected void SetAuthToken(Guid userId, string role = "Admin")
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Role, role),
            };

            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(TestJwtSecret));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer:             TestJwtIssuer,
                audience:           TestJwtAudience,
                claims:             claims,
                expires:            DateTime.UtcNow.AddHours(1),
                signingCredentials: creds);

            Client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue(
                "Bearer", new JwtSecurityTokenHandler().WriteToken(token));
        }

        protected void ClearAuthToken() =>
            Client.DefaultRequestHeaders.Authorization = null;
    }
}
