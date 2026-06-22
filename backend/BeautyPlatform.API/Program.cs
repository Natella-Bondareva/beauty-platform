using CloudinaryDotNet;
using CRMService.API;
using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.DTOs;
using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Application.Features.BookingServices.Services;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employees.Services;
using CRMService.Application.Features.Employess.Interfaces;
using CRMService.Application.Features.Pricing.Interfaces;
using CRMService.Application.Features.Pricing.Services;
using CRMService.Application.Features.SalaryModule.Interfaces;
using CRMService.Application.Features.SalaryModule.Services;
using CRMService.Application.Features.Scheduling.Interfaces;
using CRMService.Application.Features.Scheduling.Services;
using CRMService.Domain.Abstractions;
using CRMService.Infrastructure.Caching;
using CRMService.Infrastructure.Jobs;
using CRMService.Infrastructure.Persistence;
using CRMService.Infrastructure.Repositories;
using CRMService.Infrastructure.Security;
using CRMService.Infrastructure.Services;
using CRMService.Infrastructure.Storage;
using Hangfire;
using Hangfire.PostgreSql;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using StackExchange.Redis;
using System.Text;
using static CRMService.Infrastructure.Services.TwilioSmsService;

// 100 VU × кілька async операцій — збільшуємо мінімум потоків щоб уникнути черги в thread pool.
ThreadPool.SetMinThreads(200, 200);

var builder = WebApplication.CreateBuilder(args);

// ===== SERILOG =====
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();
builder.Host.UseSerilog();

// ===== CONTROLLERS =====
builder.Services.AddControllers();

// ===== CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// ===== SWAGGER =====
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Введи токен без 'Bearer' prefix — Swagger додасть сам"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

// Npgsql 6+ requires explicit UTC kind for timestamp with time zone.
// Legacy switch keeps existing behavior across all DateTime usages.
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

// ===== DATABASE =====
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(
        builder.Configuration.GetConnectionString("Default"),
        npgsql => npgsql.MinBatchSize(1).MaxBatchSize(100)));

// ===== REDIS (з fallback якщо недоступний) =====
try
{
    var redisConnStr = builder.Configuration.GetConnectionString("Redis")
        ?? "localhost:6379,connectTimeout=2000,syncTimeout=2000,allowAdmin=true";

    var redisConnection = ConnectionMultiplexer.Connect(redisConnStr);
    builder.Services.AddSingleton<IConnectionMultiplexer>(redisConnection);
    builder.Services.AddSingleton<ISlotCacheService, RedisSlotCacheService>();
    Log.Information("Redis підключено ({Endpoint}) — кешування слотів активне.",
        redisConnection.GetEndPoints().FirstOrDefault());
}
catch (Exception ex)
{
    Log.Warning("Redis недоступний ({Message}) — використовується NoOpSlotCacheService. " +
                "Запусти: docker compose up -d redis", ex.Message);
    builder.Services.AddSingleton<ISlotCacheService, NoOpSlotCacheService>();
}

// ===== HANGFIRE =====
builder.Services.AddHangfire(config => config
    .UsePostgreSqlStorage(options =>
    {
        options.UseNpgsqlConnection(
            builder.Configuration.GetConnectionString("Default"));
    }));
builder.Services.AddHangfireServer(options =>
{
    options.WorkerCount = 2;
    options.Queues = new[] { "default" };
});

// ===== CLOUDINARY =====
var cloudinaryConfig = builder.Configuration.GetSection("Cloudinary");
var account = new Account(
    cloudinaryConfig["CloudName"],
    cloudinaryConfig["ApiKey"],
    cloudinaryConfig["ApiSecret"]);
builder.Services.AddSingleton(new Cloudinary(account));

// ===== JWT =====
var jwtSecret = builder.Configuration["JwtSettings:Secret"]
    ?? throw new InvalidOperationException("JwtSettings:Secret is not configured.");
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"],
        ValidAudience = builder.Configuration["JwtSettings:Audience"],
        IssuerSigningKey = key
    };
});

// ===== DI REGISTRATION =====
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>();
builder.Services.AddScoped<ISalonRepository, SalonRepository>();
builder.Services.AddScoped<ISalonService, SalonService>();
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenProvider, JwtTokenProvider>();
builder.Services.AddScoped<RegisterUserCommandHandler>();
builder.Services.AddScoped<LoginUserCommandHandler>();
builder.Services.AddScoped<IEmployeeRepository, EmployeeRepository>();
builder.Services.AddScoped<IServiceRepository, ServiceRepository>();
builder.Services.AddScoped<ISpecializationCategoryRepository, SpecializationCategoryRepository>();
builder.Services.AddScoped<IEmployeeService, EmployeeService>();
builder.Services.AddScoped<ISalonServiceService, SalonServiceService>();
builder.Services.AddScoped<ISpecializationCategoryService, SpecializationCategoryService>();
builder.Services.AddScoped<IImageStorageService, CloudinaryImageStorageService>();
builder.Services.AddScoped<IAvailableSlotsService, AvailableSlotsService>();
builder.Services.AddScoped<IEmployeeBreakService, EmployeeBreakService>();
builder.Services.AddScoped<IEmployeeBreakRepository, EmployeeBreakRepository>();
builder.Services.AddScoped<IBookingService, BookingService>();
builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IClientRepository, ClientRepository>();
builder.Services.AddScoped<IClientService, ClientService>();
//builder.Services.AddScoped<ISmsService, TwilioSmsService>();
builder.Services.AddScoped<ISmsService, MockSmsService>();
builder.Services.AddScoped<BookingJobsService>();
builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
builder.Services.AddScoped<ISubscriptionPaymentRepository, SubscriptionPaymentRepository>();
builder.Services.AddScoped<ISubscriptionService, SubscriptionService>();
builder.Services.AddScoped<IBookingFieldRepository, BookingFieldRepository>();
builder.Services.AddScoped<IBookingFieldService, BookingFieldService>();
builder.Services.AddScoped<IBookingFieldAnswerRepository, BookingFieldAnswerRepository>();
builder.Services.AddScoped<IBookingFieldAnswerService, BookingFieldAnswerService>();
builder.Services.AddScoped<IContractRepository, ContractRepository>();
builder.Services.AddScoped<ISalaryPaymentRepository, SalaryPaymentRepository>();
builder.Services.AddScoped<ISalaryService, SalaryService>();
builder.Services.AddScoped<IAnalyticsService, AnalyticsService>();

// ===== EXCEPTION HANDLER =====
builder.Services.AddProblemDetails();

// ===== BUILD =====
var app = builder.Build();

// ===== MIDDLEWARE PIPELINE (порядок важливий) =====
app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
{
    var feature = ctx.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerFeature>();
    var ex = feature?.Error;

    var (status, title) = ex switch
    {
        KeyNotFoundException        => (StatusCodes.Status404NotFound,            "Not Found"),
        ArgumentException           => (StatusCodes.Status400BadRequest,          "Bad Request"),
        InvalidOperationException   => (StatusCodes.Status409Conflict,            "Conflict"),
        UnauthorizedAccessException => (StatusCodes.Status403Forbidden,           "Forbidden"),
        _                           => (StatusCodes.Status500InternalServerError, "Server Error")
    };

    ctx.Response.StatusCode  = status;
    ctx.Response.ContentType = "application/problem+json";
    await ctx.Response.WriteAsJsonAsync(new { title, status, detail = ex?.Message });
}));
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// ===== HANGFIRE (після Build) =====
app.UseHangfireDashboard("/hangfire");

// ===== RECURRING JOBS (після UseHangfireDashboard) =====
BookingJobsRegistration.RegisterRecurringJobs();

app.Run();

public partial class Program { }