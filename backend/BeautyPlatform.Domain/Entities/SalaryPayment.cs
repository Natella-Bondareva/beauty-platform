using CRMService.Domain.Enums;

namespace CRMService.Domain.Entities
{
public class SalaryPayment
{
    public Guid Id { get; private set; }
    public Guid MasterId { get; private set; }
    public Guid SalonId { get; private set; }
    public Guid ContractId { get; private set; }
    public DateTime PeriodStart { get; private set; }
    public DateTime PeriodEnd { get; private set; }
    public decimal EarnedAmount { get; private set; }   // нараховано
    public decimal ForecastAmount { get; private set; } // прогноз на момент створення
    public PaymentStatus Status { get; private set; }
    public DateTime? PaidAt { get; private set; }
    public string? Note { get; private set; }

    private SalaryPayment() { }

    public static SalaryPayment Create(
        Guid masterId,
        Guid salonId,
        Guid contractId,
        DateTime periodStart,
        DateTime periodEnd,
        decimal earnedAmount,
        decimal forecastAmount)
    {
        return new SalaryPayment
        {
            Id = Guid.NewGuid(),
            MasterId = masterId,
            SalonId = salonId,
            ContractId = contractId,
            PeriodStart = DateTime.SpecifyKind(periodStart, DateTimeKind.Utc),
            PeriodEnd = DateTime.SpecifyKind(periodEnd, DateTimeKind.Utc),
            EarnedAmount = earnedAmount,
            ForecastAmount = forecastAmount,
            Status = PaymentStatus.Pending
        };
    }

    // Власник натискає "Виплатив"
    public void MarkAsPaid(string? note = null)
    {
        if (Status == PaymentStatus.Paid)
            throw new InvalidOperationException("Already paid.");
        Status = PaymentStatus.Paid;
        PaidAt = DateTime.UtcNow;
        Note = note;
    }

    // Оновлення нарахованої суми якщо додались нові виконані записи
    public void UpdateEarned(decimal newAmount)
    {
        if (Status == PaymentStatus.Paid)
            throw new InvalidOperationException("Cannot update paid payment.");
        EarnedAmount = newAmount;
    }
}
}