using CloudinaryDotNet;
using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employees.Services;
using CRMService.Application.Features.Employess.Interfaces;
using CRMService.Domain.Abstractions;
using CRMService.Infrastructure.Persistence;
using CRMService.Infrastructure.Persistence.Configurations;
using CRMService.Infrastructure.Repositories;
using CRMService.Infrastructure.Security;
using CRMService.Infrastructure.Storage;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Serilog;
using System.Text;

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

// ===== CLOUDINARY =====
var cloudinaryConfig = builder.Configuration.GetSection("Cloudinary");
var account = new Account(
    cloudinaryConfig["CloudName"],
    cloudinaryConfig["ApiKey"],
    cloudinaryConfig["ApiSecret"]);
builder.Services.AddSingleton(new Cloudinary(account));

// ===== DATABASE =====
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Default")));

// ===== DI REGISTRATION =====
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IRoleRepository, RoleRepository>(); // був відсутній
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


// ===== EXCEPTION HANDLER =====
builder.Services.AddProblemDetails();

// ===== JWT — читаємо З КОНФІГУРАЦІЇ, не хардкодимо =====
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

app.UseExceptionHandler(); // GlobalExceptionHandler
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();