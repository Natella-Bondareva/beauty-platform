using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Application.Features.Pricing.DTOs;
using CRMService.Application.Features.SalaryModule.Interfaces;
using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.SalaryModule.Services
{
    public class SalaryService : ISalaryService
    {
        private readonly IContractRepository _contractRepository;
        private readonly ISalaryPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly ISalonRepository _salonRepository;

        public SalaryService(
            IContractRepository contractRepository,
            ISalaryPaymentRepository paymentRepository,
            IBookingRepository bookingRepository,
            ISalonRepository salonRepository)
        {
            _contractRepository = contractRepository;
            _paymentRepository = paymentRepository;
            _bookingRepository = bookingRepository;
            _salonRepository = salonRepository;
        }

        public async Task<Guid> CreateContractAsync(
            Guid salonId,
            CreateContractCommand command,
            Guid ownerId)
        {
            await EnsureOwnership(salonId, ownerId);

            // Деактивуємо старий контракт якщо є
            var existing = await _contractRepository.GetActiveByMasterIdAsync(command.MasterId);
            existing?.Deactivate();

            var contract = MasterContract.Create(
                command.MasterId,
                salonId,
                command.Type,
                command.Amount,
                command.PaymentPeriodDays);

            await _contractRepository.AddAsync(contract);
            return contract.Id;
        }

        public async Task<SalaryPaymentDto> GeneratePaymentAsync(
            Guid salonId,
            Guid masterId,
            DateTime periodStart,
            DateTime periodEnd,
            Guid ownerId)
        {
            await EnsureOwnership(salonId, ownerId);

            var contract = await _contractRepository.GetActiveByMasterIdAsync(masterId)
                ?? throw new KeyNotFoundException("Active contract not found.");

            // Виконані записи за період
            var completedBookings = await _bookingRepository
                .GetCompletedByMasterAsync(masterId, periodStart, periodEnd);

            var totalCompleted = completedBookings.Sum(b => b.Price);
            var periodDays = (int)(periodEnd - periodStart).TotalDays;

            // Заплановані але ще не виконані — для прогнозу
            var plannedBookings = await _bookingRepository
                .GetPlannedByMasterAsync(masterId, periodStart, periodEnd);

            var totalPlanned = plannedBookings.Sum(b => b.Price);

            var earned = contract.CalculateSalary(totalCompleted, periodDays);
            var forecast = contract.ForecastSalary(totalCompleted + totalPlanned);

            var payment = SalaryPayment.Create(
                masterId, salonId, contract.Id,
                periodStart, periodEnd,
                earned, forecast);

            await _paymentRepository.AddAsync(payment);
            return MapToDto(payment, "");
        }

        public async Task MarkAsPaidAsync(
            Guid paymentId,
            MarkAsPaidCommand command,
            Guid ownerId)
        {
            var payment = await _paymentRepository.GetByIdAsync(paymentId)
                ?? throw new KeyNotFoundException("Payment not found.");

            await EnsureOwnership(payment.SalonId, ownerId);
            payment.MarkAsPaid(command.Note);
            await _paymentRepository.UpdateAsync(payment);
        }

        public async Task<List<SalaryForecastDto>> GetForecastAsync(Guid salonId, Guid ownerId)
        {
            await EnsureOwnership(salonId, ownerId);

            var contracts = await _contractRepository.GetActiveBySalonIdAsync(salonId);
            var forecasts = new List<SalaryForecastDto>();

            foreach (var contract in contracts)
            {
                var now = DateTime.UtcNow;
                var periodEnd = now.AddDays(contract.PaymentPeriodDays);

                var completed = await _bookingRepository
                    .GetCompletedByMasterAsync(contract.MasterId, now, periodEnd);
                var planned = await _bookingRepository
                    .GetPlannedByMasterAsync(contract.MasterId, now, periodEnd);

                var earnedSoFar = contract.CalculateSalary(
                    completed.Sum(b => b.Price),
                    contract.PaymentPeriodDays);

                var forecast = contract.ForecastSalary(
                    completed.Sum(b => b.Price) + planned.Sum(b => b.Price));

                forecasts.Add(new SalaryForecastDto
                {
                    MasterId = contract.MasterId,
                    MasterName = "",  // заповниш через MasterRepository
                    ForecastAmount = forecast,
                    EarnedSoFar = earnedSoFar,
                    PlannedBookingsCount = planned.Count,
                    CompletedBookingsCount = completed.Count,
                    PeriodEnd = periodEnd
                });
            }

            return forecasts;
        }

        private async Task EnsureOwnership(Guid salonId, Guid ownerId)
        {
            var salon = await _salonRepository.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);
        }
        // SalaryService.cs — додай реалізацію методів
        public async Task<ContractDto> GetContractAsync(Guid masterId, Guid salonId, Guid ownerId)
        {
            await EnsureOwnership(salonId, ownerId);
            var contract = await _contractRepository.GetActiveByMasterIdAsync(masterId)
                ?? throw new KeyNotFoundException("Active contract not found.");
            return MapContractToDto(contract);
        }

        public async Task UpdateContractAsync(
            Guid contractId,
            UpdateContractCommand command,
            Guid ownerId)
        {
            var contract = await _contractRepository.GetByIdAsync(contractId)
                ?? throw new KeyNotFoundException("Contract not found.");
            await EnsureOwnership(contract.SalonId, ownerId);
            contract.Update(command.Amount, command.PaymentPeriodDays);
            await _contractRepository.UpdateAsync(contract);
        }

        public async Task<List<SalaryPaymentDto>> GetPaymentsAsync(
            Guid salonId,
            Guid? masterId,
            DateTime? from,
            DateTime? to,
            Guid ownerId)
        {
            await EnsureOwnership(salonId, ownerId);

            List<SalaryPayment> payments;

            if (masterId.HasValue)
                payments = await _paymentRepository.GetByMasterAsync(masterId.Value, from, to);
            else
                payments = await _paymentRepository.GetBySalonAsync(salonId, from, to);

            return payments.Select(p => MapToDto(p, "")).ToList();
        }

        // Додай маппер для контракту
        private static ContractDto MapContractToDto(MasterContract c) => new()
        {
            Id = c.Id,
            MasterId = c.MasterId,
            Type = c.Type.ToString(),
            Amount = c.Amount,
            PaymentPeriodDays = c.PaymentPeriodDays,
            IsActive = c.IsActive,
            StartedAt = c.StartedAt
        };

        private static SalaryPaymentDto MapToDto(SalaryPayment p, string masterName) => new()
        {
            Id = p.Id,
            MasterId = p.MasterId,
            MasterName = masterName,
            PeriodStart = p.PeriodStart,
            PeriodEnd = p.PeriodEnd,
            EarnedAmount = p.EarnedAmount,
            ForecastAmount = p.ForecastAmount,
            Status = p.Status.ToString(),
            PaidAt = p.PaidAt,
            Note = p.Note
        };
    }
}
