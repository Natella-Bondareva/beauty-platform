using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.Pricing.DTOs;
using CRMService.Application.Features.Pricing.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Pricing.Services
{
    public class SubscriptionService : ISubscriptionService
    {
        private readonly ISubscriptionRepository _repo;
        private readonly ISalonRepository _salonRepository;
        private readonly ISubscriptionPaymentRepository _paymentRepo;

        public SubscriptionService(
            ISubscriptionRepository repo,
            ISalonRepository salonRepository,
            ISubscriptionPaymentRepository paymentRepo)
        {
            _repo = repo;
            _salonRepository = salonRepository;
            _paymentRepo = paymentRepo;
        }

        public async Task<SubscriptionDto> GetAsync(Guid salonId, Guid userId)
        {
            await EnsureOwnership(salonId, userId);
            var sub = await _repo.GetBySalonIdAsync(salonId)
                ?? throw new KeyNotFoundException("Subscription not found.");
            return MapToDto(sub);
        }

        public async Task AddMasterSlotsAsync(Guid salonId, int count, int months, Guid userId)
        {
            await EnsureOwnership(salonId, userId);
            var sub = await _repo.GetBySalonIdAsync(salonId)
                ?? throw new KeyNotFoundException("Subscription not found.");
            sub.AddMasterSlots(count, months);
            await _repo.UpdateAsync(sub);
        }

        public async Task AddModuleAsync(Guid salonId, ModuleType module, int months, Guid userId)
        {
            await EnsureOwnership(salonId, userId);
            var sub = await _repo.GetBySalonIdAsync(salonId)
                ?? throw new KeyNotFoundException("Subscription not found.");
            sub.AddModule(module, months);
            await _repo.UpdateAsync(sub);
        }

        public async Task<SubscriptionPaymentDto> ProcessPaymentAsync(
            Guid salonId,
            CreatePaymentRequest request,
            Guid userId)
        {
            await EnsureOwnership(salonId, userId);

            var sub = await _repo.GetBySalonIdAsync(salonId)
                ?? throw new KeyNotFoundException("Subscription not found.");

            // Calculate the amount to charge
            decimal amount = request.ItemType switch
            {
                "Module" when request.ModuleId.HasValue =>
                    PlanFeatures.GetModulePrice((ModuleType)request.ModuleId.Value) * request.Months,
                "MasterSlots" when request.SlotCount.HasValue =>
                    PlanFeatures.PricePerMaster * request.SlotCount.Value * request.Months,
                _ => throw new ArgumentException("Invalid payment request.")
            };

            var description = request.ItemType == "Module"
                ? $"Модуль {(ModuleType)request.ModuleId!.Value} — {request.Months} міс."
                : $"{request.SlotCount} слот(и) майстрів — {request.Months} міс.";

            var payment = SubscriptionPayment.Create(salonId, amount, description);
            await _paymentRepo.AddAsync(payment);

            // TODO: replace with real payment provider (Monobank acquiring / LiqPay):
            //   var result = await _paymentProvider.CreateInvoiceAsync(amount, description);
            //   if (!result.Success) { payment.Fail(result.Error); ... throw; }
            //   payment.Complete(result.ExternalId);
            // For now: fake payment — immediately mark as completed.
            payment.Complete(externalPaymentId: null, note: "Тестова оплата");

            // Activate what was paid for
            if (request.ItemType == "Module")
                sub.AddModule((ModuleType)request.ModuleId!.Value, request.Months);
            else
                sub.AddMasterSlots(request.SlotCount!.Value, request.Months);

            await _repo.UpdateAsync(sub);
            await _paymentRepo.UpdateAsync(payment);

            return MapPaymentToDto(payment);
        }

        public async Task<List<SubscriptionPaymentDto>> GetPaymentsAsync(Guid salonId, Guid userId)
        {
            await EnsureOwnership(salonId, userId);
            var payments = await _paymentRepo.GetBySalonIdAsync(salonId);
            return payments
                .OrderByDescending(p => p.CreatedAt)
                .Select(MapPaymentToDto)
                .ToList();
        }

        private static SubscriptionPaymentDto MapPaymentToDto(SubscriptionPayment p) => new()
        {
            Id = p.Id,
            Amount = p.Amount,
            Description = p.Description,
            Status = p.Status.ToString(),
            CreatedAt = p.CreatedAt,
            CompletedAt = p.CompletedAt,
            Note = p.Note,
            ExternalPaymentId = p.ExternalPaymentId,
        };

        private async Task EnsureOwnership(Guid salonId, Guid userId)
        {
            var salon = await _salonRepository.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(userId);
        }

        private static SubscriptionDto MapToDto(Subscription sub) => new()
        {
            Id = sub.Id,
            MasterLimit = sub.GetMasterLimit(),
            MonthlyPrice = sub.CalculateMonthlyPrice(),
            IsActive = sub.IsActive,
            Modules = sub.Modules
                .Where(x => !x.IsExpired())
                .Select(x => new SubscriptionModuleDto
                {
                    Module = x.Module.ToString(),
                    ExpiresAt = x.ExpiresAt
                })
                .ToList(),
            // Показуємо які модулі активні включно з безкоштовними
            ActiveModules = Enum.GetValues<ModuleType>()
                .Where(m => sub.HasModule(m))
                .Select(m => m.ToString())
                .ToList()
        };

        public SubscriptionConfigDto GetConfig()
        {
            return new SubscriptionConfigDto
            {
                PricePerMaster = PlanFeatures.PricePerMaster,
                FreeModules = Enum.GetValues<ModuleType>()
                    .Where(PlanFeatures.IsModuleFree)
                    .Select(m => new ModuleConfigDto
                    {
                        Id = (int)m,
                        Name = m.ToString(),
                        Price = 0,
                        IsFree = true
                    })
                    .ToList(),
                PaidModules = Enum.GetValues<ModuleType>()
                    .Where(m => !PlanFeatures.IsModuleFree(m))
                    .Select(m => new ModuleConfigDto
                    {
                        Id = (int)m,
                        Name = m.ToString(),
                        Price = PlanFeatures.GetModulePrice(m),
                        IsFree = false
                    })
                    .ToList()
            };
        }
    }

}
