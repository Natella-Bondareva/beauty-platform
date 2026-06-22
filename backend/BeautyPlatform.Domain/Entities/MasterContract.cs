using CRMService.Domain.Enums;

namespace CRMService.Domain.Entities
{
public class MasterContract
{
    public Guid Id { get; private set; }
    public Guid MasterId { get; private set; }
    public Guid SalonId { get; private set; }
    public ContractType Type { get; private set; }
    public decimal Amount { get; private set; }  // ставка або відсоток
    public int PaymentPeriodDays { get; private set; }  // наприклад 7, 14, 30
    public DateTime StartedAt { get; private set; }
    public bool IsActive { get; private set; }

    private MasterContract() { }

    public static MasterContract Create(
        Guid masterId,
        Guid salonId,
        ContractType type,
        decimal amount,
        int paymentPeriodDays)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be greater than 0.");
        if (type == ContractType.Percentage && amount > 100)
            throw new ArgumentException("Percentage cannot exceed 100.");
        if (paymentPeriodDays <= 0)
            throw new ArgumentException("Payment period must be greater than 0.");

        return new MasterContract
        {
            Id = Guid.NewGuid(),
            MasterId = masterId,
            SalonId = salonId,
            Type = type,
            Amount = amount,
            PaymentPeriodDays = paymentPeriodDays,
            StartedAt = DateTime.UtcNow,
            IsActive = true
        };
    }

    public void Update(decimal amount, int paymentPeriodDays)
    {
        if (amount <= 0)
            throw new ArgumentException("Amount must be greater than 0.");
        if (Type == ContractType.Percentage && amount > 100)
            throw new ArgumentException("Percentage cannot exceed 100.");

        Amount = amount;
        PaymentPeriodDays = paymentPeriodDays;
    }

    public void Deactivate() => IsActive = false;

    // Розрахунок зарплати за період
    public decimal CalculateSalary(decimal totalCompletedAmount, int periodDays)
    {
        return Type switch
        {
            ContractType.FixedRate => Amount * (periodDays / (decimal)PaymentPeriodDays),
            ContractType.Percentage => totalCompletedAmount * (Amount / 100),
            _ => 0
        };
    }

    // Прогноз на основі запланованих записів
    public decimal ForecastSalary(decimal plannedAmount)
    {
        return Type switch
        {
            ContractType.FixedRate => Amount,  // фіксована — прогноз = ставка
            ContractType.Percentage => plannedAmount * (Amount / 100),
            _ => 0
        };
    }
}
}