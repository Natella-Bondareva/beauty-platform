using CRMService.Application.Features.BookingServices.Interfaces;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Infrastructure.Services
{
    public class MockSmsService : ISmsService
    {
        private readonly ILogger<MockSmsService> _logger;
        // Зберігаємо останній код щоб можна було перевірити
        private static string? _lastCode;

        public MockSmsService(ILogger<MockSmsService> logger)
        {
            _logger = logger;
        }

        public Task SendVerificationCodeAsync(string phone)
        {
            // Генеруємо код і зберігаємо
            _lastCode = new Random().Next(1000, 9999).ToString();

            // Виводимо в консоль сервера — видно в терміналі
            _logger.LogWarning("=== MOCK SMS ===");
            _logger.LogWarning("Phone: {Phone}", phone);
            _logger.LogWarning("Code:  {Code}", _lastCode);
            _logger.LogWarning("================");

            return Task.CompletedTask;
        }

        public Task<bool> CheckVerificationCodeAsync(string phone, string code)
        {
            var isValid = code == _lastCode;
            _logger.LogWarning("Code check: {Code} → {Result}", code, isValid ? "OK" : "FAIL");
            return Task.FromResult(isValid);
        }
    }
}
