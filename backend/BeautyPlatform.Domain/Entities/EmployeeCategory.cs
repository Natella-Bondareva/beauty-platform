namespace CRMService.Domain.Entities
{
    /// <summary>
    /// M:M між Employee і SpecializationCategory.
    /// Майстер може мати кілька спеціалізацій.
    /// </summary>
    public class EmployeeCategory
    {
        public Guid EmployeeId { get; private set; }
        public Guid CategoryId { get; private set; }
        public DateTime AssignedAt { get; private set; }

        // Navigation
        public Employee Employee { get; private set; } = default!;
        public SpecializationCategory Category { get; private set; } = default!;

        private EmployeeCategory() { } // EF Core

        public EmployeeCategory(Guid employeeId, Guid categoryId)
        {
            EmployeeId = employeeId;
            CategoryId = categoryId;
            AssignedAt = DateTime.UtcNow;
        }
    }
}
