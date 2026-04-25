using CRMService.Application.Features.BookingServices.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using Twilio;
using Twilio.Rest.Api.V2010.Account;
using Twilio.Rest.Verify.V2.Service;


namespace CRMService.Infrastructure.Services
{
    public class TwilioSmsService : ISmsService
    {
        private readonly string _verifyServiceSid;

        public TwilioSmsService(IConfiguration config)
        {
            var accountSid = config["Twilio:AccountSid"]
                ?? throw new InvalidOperationException("Twilio:AccountSid not configured.");
            var authToken = config["Twilio:AuthToken"]
                ?? throw new InvalidOperationException("Twilio:AuthToken not configured.");
            _verifyServiceSid = config["Twilio:VerifyServiceSid"]
                ?? throw new InvalidOperationException("Twilio:VerifyServiceSid not configured.");

            TwilioClient.Init(accountSid, authToken);
        }

        public async Task SendVerificationCodeAsync(string phone)
        {
            await VerificationResource.CreateAsync(
                to: phone,
                channel: "sms",
                pathServiceSid: _verifyServiceSid);
        }

        public async Task<bool> CheckVerificationCodeAsync(string phone, string code)
        {
            var verificationCheck = await VerificationCheckResource.CreateAsync(
                to: phone,
                code: code,
                pathServiceSid: _verifyServiceSid);

            return verificationCheck.Status == "approved";
        }
    }
}
