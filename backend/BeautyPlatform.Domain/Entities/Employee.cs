namespace CRMService.Domain.Entities
{
    public class Employee
    {
        public Guid Id { get; private set; }
        public Guid SalonId { get; private set; }

        // CategoryId ВИДАЛЕНО — замінено на M:M через EmployeeCategory

        public Guid? UserId { get; private set; }
        public string FullName { get; private set; } = default!;
        public string Phone { get; private set; } = default!;
        public string? Email { get; private set; }
        public string? AvatarUrl { get; private set; }
        public DateTime HireDate { get; private set; }
        public bool IsActive { get; private set; } = true;
        public DateTime CreatedAt { get; private set; }

        // Navigation
        public Salon Salon { get; private set; } = default!;

        private readonly List<EmployeeCategory> _categories = new();
        public IReadOnlyCollection<EmployeeCategory> Categories => _categories.AsReadOnly();

        private readonly List<EmployeeService> _services = new();
        public IReadOnlyCollection<EmployeeService> Services => _services.AsReadOnly();

        private readonly List<MasterSchedule> _schedules = new();
        public IReadOnlyCollection<MasterSchedule> Schedules => _schedules.AsReadOnly();

        private Employee() { } // EF Core

        public Employee(
            Guid salonId,
            string fullName,
            string phone,
            DateTime hireDate,
            string? email = null,
            string? avatarUrl = null)
        {
            Id = Guid.NewGuid();
            SalonId = salonId;
            HireDate = hireDate;
            CreatedAt = DateTime.UtcNow;

            SetFullName(fullName);
            SetPhone(phone);
            SetEmail(email);
            AvatarUrl = avatarUrl;
        }

        public void Update(string fullName, string phone, string? email, string? avatarUrl)
        {
            SetFullName(fullName);
            SetPhone(phone);
            SetEmail(email);
            AvatarUrl = avatarUrl;
        }

        // ── Категорії ──────────────────────────────────────────────

        public void AddCategory(Guid categoryId)
        {
            if (_categories.Any(c => c.CategoryId == categoryId))
                throw new InvalidOperationException("Category already assigned to this employee.");

            _categories.Add(new EmployeeCategory(Id, categoryId));
        }

        public void RemoveCategory(Guid categoryId)
        {
            var category = _categories.FirstOrDefault(c => c.CategoryId == categoryId)
                ?? throw new KeyNotFoundException("Category not found on this employee.");

            if (_categories.Count == 1)
                throw new InvalidOperationException("Employee must have at least one category.");

            _categories.Remove(category);
        }

        // ── User account ───────────────────────────────────────────

        public void AssignUser(Guid userId)
        {
            if (UserId.HasValue)
                throw new InvalidOperationException("Employee already has a user account.");
            UserId = userId;
        }

        public void UnassignUser() => UserId = null;

        public void Deactivate() => IsActive = false;
        public void Activate() => IsActive = true;

        public void EnsureBelongsToSalon(Guid salonId)
        {
            if (SalonId != salonId)
                throw new UnauthorizedAccessException("Employee does not belong to this salon.");
        }

        // ── Private ────────────────────────────────────────────────

        private void SetFullName(string fullName)
        {
            if (string.IsNullOrWhiteSpace(fullName) || fullName.Trim().Length < 3)
                throw new ArgumentException("Full name must be at least 3 characters.");
            FullName = fullName.Trim();
        }

        private void SetPhone(string phone)
        {
            if (string.IsNullOrWhiteSpace(phone))
                throw new ArgumentException("Phone is required.");
            if (!System.Text.RegularExpressions.Regex.IsMatch(phone, @"^\+?[1-9]\d{7,14}$"))
                throw new ArgumentException("Invalid phone format.");
            Phone = phone;
        }

        private void SetEmail(string? email)
        {
            if (email is null) { Email = null; return; }
            if (!email.Contains('@'))
                throw new ArgumentException("Invalid email format.");
            Email = email.Trim().ToLowerInvariant();
        }
    }
}