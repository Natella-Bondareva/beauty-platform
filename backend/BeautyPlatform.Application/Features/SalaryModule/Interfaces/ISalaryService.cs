using CRMService.Application.Features.Pricing.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.SalaryModule.Interfaces
{
    public interface ISalaryService
    {
        // Контракти
        Task<ContractDto> GetContractAsync(Guid masterId, Guid salonId, Guid ownerId);
        Task<Guid> CreateContractAsync(Guid salonId, CreateContractCommand command, Guid ownerId);
        Task UpdateContractAsync(Guid contractId, UpdateContractCommand command, Guid ownerId);

        // Виплати
        Task<List<SalaryPaymentDto>> GetPaymentsAsync(
            Guid salonId,
            Guid? masterId,
            DateTime? from,
            DateTime? to,
            Guid ownerId);

        Task<SalaryPaymentDto> GeneratePaymentAsync(
            Guid salonId,
            Guid masterId,
            DateTime periodStart,
            DateTime periodEnd,
            Guid ownerId);

        Task MarkAsPaidAsync(Guid paymentId, MarkAsPaidCommand command, Guid ownerId);

        // Прогноз
        Task<List<SalaryForecastDto>> GetForecastAsync(Guid salonId, Guid ownerId);
    }
}
