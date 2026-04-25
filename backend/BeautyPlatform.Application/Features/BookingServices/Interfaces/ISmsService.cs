using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.BookingServices.Interfaces
{
    public interface ISmsService
    {
        /// <summary>Відправляє SMS код через Twilio Verify</summary>
        Task SendVerificationCodeAsync(string phone);

        /// <summary>
        /// Перевіряє код який ввів клієнт.
        /// Повертає true якщо код правильний.
        /// </summary>
        Task<bool> CheckVerificationCodeAsync(string phone, string code);
    }
}
