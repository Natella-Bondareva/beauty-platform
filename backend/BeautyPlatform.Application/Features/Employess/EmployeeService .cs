using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employess.Commands.Employee_Commands;
using CRMService.Application.Features.Employess.DTOs;
using CRMService.Application.Features.Employess.Interfaces;
using CRMService.Application.Features.Scheduling.DTOs;
using CRMService.Domain.Entities;

namespace CRMService.Application.Features.Employees.Services
{
    public class EmployeeService : IEmployeeService
    {
        private readonly IEmployeeRepository _employeeRepo;
        private readonly IServiceRepository _serviceRepo;
        private readonly ISpecializationCategoryRepository _categoryRepo;
        private readonly ISalonRepository _salonRepo;
        private readonly IUserRepository _userRepo;

        public EmployeeService(
            IEmployeeRepository employeeRepo,
            IServiceRepository serviceRepo,
            ISpecializationCategoryRepository categoryRepo,
            ISalonRepository salonRepo,
            IUserRepository userRepo)
        {
            _employeeRepo = employeeRepo;
            _serviceRepo = serviceRepo;
            _categoryRepo = categoryRepo;
            _salonRepo = salonRepo;
            _userRepo = userRepo;
        }

        public async Task<Guid> CreateAsync(CreateEmployeeCommand command, Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);

            if (!command.CategoryIds.Any())
                throw new ArgumentException("At least one category is required.");

            foreach (var categoryId in command.CategoryIds)
            {
                var category = await _categoryRepo.GetByIdWithDefaultServicesAsync(categoryId)
                    ?? throw new KeyNotFoundException($"Category {categoryId} not found.");
                category.EnsureSalonAccess(salonId);
            }

            if (!string.IsNullOrWhiteSpace(command.Email))
            {
                var emailExists = await _employeeRepo.EmailExistsInSalonAsync(salonId, command.Email);
                if (emailExists)
                    throw new InvalidOperationException("Employee with this email already exists.");
            }

            var employee = new Employee(
                salonId,
                command.FullName,
                command.Phone,
                command.HireDate,
                command.Email,
                command.AvatarUrl);

            if (command.UserAccount is not null)
            {
                var userId = await CreateEmployeeUserAccount(command.UserAccount, command.FullName, salonId);
                employee.AssignUser(userId);
            }

            await _employeeRepo.AddAsync(employee);

            foreach (var categoryId in command.CategoryIds)
            {
                employee.AddCategory(categoryId);

                var category = await _categoryRepo.GetByIdWithDefaultServicesAsync(categoryId)!;
                // ✓ передаємо categoryId в AssignDefaultServicesAsync
                await AssignDefaultServicesAsync(employee, category!, salonId, categoryId);
            }

            await _employeeRepo.UpdateAsync(employee);
            await InitializeDefaultScheduleAsync(employee);

            return employee.Id;
        }

        public async Task UpdateAsync(Guid employeeId, UpdateEmployeeCommand command, Guid salonId, Guid ownerId)
        {
            var employee = await GetEmployeeAndEnsureAccess(employeeId, salonId, ownerId);

            if (!command.CategoryIds.Any())
                throw new ArgumentException("At least one category is required.");

            foreach (var categoryId in command.CategoryIds)
            {
                var category = await _categoryRepo.GetByIdAsync(categoryId)
                    ?? throw new KeyNotFoundException($"Category {categoryId} not found.");
                category.EnsureSalonAccess(salonId);
            }

            if (!string.IsNullOrWhiteSpace(command.Email))
            {
                var emailExists = await _employeeRepo.EmailExistsInSalonAsync(salonId, command.Email, excludeId: employeeId);
                if (emailExists)
                    throw new InvalidOperationException("Employee with this email already exists.");
            }

            employee.Update(command.FullName, command.Phone, command.Email, command.AvatarUrl);
            await _employeeRepo.ReplaceCategoriesAsync(employeeId, command.CategoryIds);
            await _employeeRepo.UpdateAsync(employee);
        }

        public async Task DeactivateAsync(Guid employeeId, Guid salonId, Guid ownerId)
        {
            var employee = await GetEmployeeAndEnsureAccess(employeeId, salonId, ownerId);
            employee.Deactivate();
            await _employeeRepo.UpdateAsync(employee);
        }

        public async Task<EmployeeDto> GetByIdAsync(Guid employeeId, Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);

            var employee = await _employeeRepo.GetByIdWithServicesAsync(employeeId)
                ?? throw new KeyNotFoundException("Employee not found.");
            employee.EnsureBelongsToSalon(salonId);

            return MapToDto(employee);
        }

        public async Task<List<EmployeeListItemDto>> GetBySalonAsync(Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);
            var employees = await _employeeRepo.GetBySalonIdAsync(salonId);
            return employees.Select(MapToListItemDto).ToList();
        }

        // ── Employee ↔ Service ─────────────────────────────────────

        public async Task AssignServiceAsync(
            Guid employeeId,
            Guid serviceId,
            decimal? priceOverride,
            int? systemDurationOverride,
            int? clientDurationOverride,
            Guid salonId,
            Guid ownerId)
        {
            var employee = await GetEmployeeAndEnsureAccess(employeeId, salonId, ownerId);

            var service = await _serviceRepo.GetByIdAsync(serviceId)
                ?? throw new KeyNotFoundException("Service not found.");
            service.EnsureBelongsToSalon(salonId);

            if (!service.IsActive)
                throw new InvalidOperationException("Cannot assign an inactive service.");

            var alreadyAssigned = employee.Services.Any(s => s.ServiceId == serviceId);
            if (alreadyAssigned)
                throw new InvalidOperationException("Service is already assigned to this employee.");

            // ✓ передаємо всі три override
            var employeeService = new Domain.Entities.EmployeeService(
                employeeId,
                serviceId,
                priceOverride,
                systemDurationOverride,
                clientDurationOverride);

            await _employeeRepo.AddServiceToEmployeeAsync(employeeId, employeeService);
        }

        public async Task RemoveServiceAsync(Guid employeeId, Guid serviceId, Guid salonId, Guid ownerId)
        {
            await GetEmployeeAndEnsureAccess(employeeId, salonId, ownerId);
            await _employeeRepo.RemoveServiceFromEmployeeAsync(employeeId, serviceId);
        }

        // ✓ Оновлений метод — приймає всі три override
        public async Task UpdateServiceOverridesAsync(
            Guid employeeId,
            Guid serviceId,
            decimal? priceOverride,
            int? systemDurationOverride,
            int? clientDurationOverride,
            Guid salonId,
            Guid ownerId)
        {
            await GetEmployeeAndEnsureAccess(employeeId, salonId, ownerId);
            await _employeeRepo.UpdateEmployeeServiceOverridesAsync(
                employeeId, serviceId,
                priceOverride, systemDurationOverride, clientDurationOverride);
        }

        public async Task<Guid> RegisterSelfAsEmployeeAsync(
            RegisterSelfAsEmployeeCommand command,
            Guid salonId,
            Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);

            var alreadyEmployee = await _employeeRepo.GetByUserIdAsync(ownerId, salonId);
            if (alreadyEmployee is not null)
                throw new InvalidOperationException("You are already registered as an employee.");

            if (!command.CategoryIds.Any())
                throw new ArgumentException("At least one category is required.");

            var user = await _userRepo.GetByIdAsync(ownerId)
                ?? throw new KeyNotFoundException("User not found.");

            var fullName = $"{user.FirstName} {user.LastName}".Trim();

            var employee = new Employee(
                salonId,
                fullName,
                command.Phone,
                command.HireDate ?? DateTime.UtcNow,
                email: user.Email,
                avatarUrl: null);

            employee.AssignUser(ownerId);
            await _employeeRepo.AddAsync(employee);

            foreach (var categoryId in command.CategoryIds)
            {
                var category = await _categoryRepo.GetByIdWithDefaultServicesAsync(categoryId)
                    ?? throw new KeyNotFoundException($"Category {categoryId} not found.");
                category.EnsureSalonAccess(salonId);

                employee.AddCategory(categoryId);
                await AssignDefaultServicesAsync(employee, category, salonId, categoryId);
            }

            await _employeeRepo.UpdateAsync(employee);
            await InitializeDefaultScheduleAsync(employee);

            return employee.Id;
        }

        // ── Schedule ───────────────────────────────────────────────
        public async Task<ScheduleConstraintsDto> GetScheduleConstraintsAsync(
    Guid employeeId,
    Guid salonId,
    Guid ownerId)
        {
            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);

            var employee = await _employeeRepo.GetByIdWithScheduleAsync(employeeId)
                ?? throw new KeyNotFoundException("Employee not found.");
            employee.EnsureBelongsToSalon(salonId);

            return new ScheduleConstraintsDto
            {
                SalonOpeningTime = salon.Settings.OpeningTime,
                SalonClosingTime = salon.Settings.ClosingTime,
                SalonDaysOff = salon.Settings.RegularDaysOff
                    .Select(d => d.DayOfWeek)
                    .ToList(),
                CurrentSchedule = employee.Schedules
                    .OrderBy(s => s.DayOfWeek)
                    .Select(s => new ScheduleDto
                    {
                        DayOfWeek = s.DayOfWeek,
                        IsWorking = s.IsWorking,
                        StartTime = s.StartTime,
                        EndTime = s.EndTime
                    }).ToList()
            };
        }

        // Також додай в EmployeeService.SetScheduleAsync валідацію меж:
        public async Task SetScheduleAsync(
            Guid employeeId,
            List<ScheduleItemCommand> schedule,
            Guid salonId,
            Guid ownerId)
        {
            await GetEmployeeAndEnsureAccess(employeeId, salonId, ownerId);

            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");

            var salonOpening = salon.Settings.OpeningTime;
            var salonClosing = salon.Settings.ClosingTime;

            foreach (var day in schedule.Where(s => s.IsWorking))
            {
                if (day.StartTime < salonOpening)
                    throw new InvalidOperationException(
                        $"Час початку ({day.StartTime:hh\\:mm}) не може бути раніше " +
                        $"відкриття салону ({salonOpening:hh\\:mm}).");

                if (day.EndTime > salonClosing)
                    throw new InvalidOperationException(
                        $"Час завершення ({day.EndTime:hh\\:mm}) не може бути пізніше " +
                        $"закриття салону ({salonClosing:hh\\:mm}).");

                if (day.StartTime >= day.EndTime)
                    throw new ArgumentException(
                        $"Час початку має бути меншим за час завершення для {day.DayOfWeek}.");
            }

            await _employeeRepo.ReplaceScheduleAsync(employeeId, schedule.Select(s =>
                new MasterSchedule(employeeId, s.DayOfWeek, s.StartTime, s.EndTime, s.IsWorking)
            ).ToList());
        }

        // ── Private Helpers ────────────────────────────────────────

        private async Task<Guid> CreateEmployeeUserAccount(CreateEmployeeUserCommand cmd, string fullName, Guid salonId)
        {
            return await _userRepo.CreateEmployeeUserAsync(cmd.Email, fullName, cmd.Password, salonId);
        }

        private async Task AssignDefaultServicesAsync(
            Employee employee,
            SpecializationCategory category,
            Guid salonId,
            Guid categoryId) // ✓ додано categoryId
        {
            foreach (var defaultSvc in category.DefaultServices)
            {
                var existingServices = await _serviceRepo.GetBySalonIdAsync(salonId);
                var existing = existingServices.FirstOrDefault(s =>
                    s.Name.Equals(defaultSvc.Name, StringComparison.OrdinalIgnoreCase) && s.IsActive);

                Service serviceToAssign;
                if (existing is not null)
                {
                    serviceToAssign = existing;
                }
                else
                {
                    // ✓ передаємо categoryId при створенні послуги
                    serviceToAssign = new Service(
                        salonId,
                        categoryId,
                        defaultSvc.Name,
                        defaultSvc.SystemDurationMinutes,
                        defaultSvc.ClientDurationMinutes,
                        defaultSvc.SuggestedPrice,
                        defaultSvc.Description);
                    await _serviceRepo.AddAsync(serviceToAssign);
                }

                var employeeService = new Domain.Entities.EmployeeService(employee.Id, serviceToAssign.Id);
                await _employeeRepo.AddServiceToEmployeeAsync(employee.Id, employeeService);
            }
        }

        private async Task InitializeDefaultScheduleAsync(Employee employee)
        {
            var schedule = Enum.GetValues<DayOfWeek>().Select(day =>
                new MasterSchedule(employee.Id, day, TimeSpan.FromHours(9), TimeSpan.FromHours(18), isWorking: false)
            ).ToList();

            await _employeeRepo.ReplaceScheduleAsync(employee.Id, schedule);
        }

        private async Task EnsureSalonOwnership(Guid salonId, Guid ownerId)
        {
            var salon = await _salonRepo.GetByIdAsync(salonId)
                ?? throw new KeyNotFoundException("Salon not found.");
            salon.EnsureOwnership(ownerId);
        }

        private async Task<Employee> GetEmployeeAndEnsureAccess(Guid employeeId, Guid salonId, Guid ownerId)
        {
            await EnsureSalonOwnership(salonId, ownerId);
            var employee = await _employeeRepo.GetByIdAsync(employeeId)
                ?? throw new KeyNotFoundException("Employee not found.");
            employee.EnsureBelongsToSalon(salonId);
            return employee;
        }

        // ── Mappers ────────────────────────────────────────────────

        private static EmployeeDto MapToDto(Employee e) => new()
        {
            Id = e.Id,
            SalonId = e.SalonId,
            Categories = e.Categories.Select(c => new CategoryShortDto
            {
                Id = c.CategoryId,
                Name = c.Category?.Name ?? string.Empty
            }).ToList(),
            FullName = e.FullName,
            Phone = e.Phone,
            Email = e.Email,
            AvatarUrl = e.AvatarUrl,
            HireDate = e.HireDate,
            IsActive = e.IsActive,
            HasUserAccount = e.UserId.HasValue,
            Services = e.Services.Select(s => new EmployeeServiceDto
            {
                ServiceId = s.ServiceId,
                ServiceName = s.Service?.Name ?? string.Empty,
                // ✓ CategoryName береться з навігаційної властивості
                CategoryName = s.Service?.Category?.Name ?? string.Empty,
                BasePrice = s.Service?.Price ?? 0,
                BaseSystemDuration = s.Service?.SystemDurationMinutes ?? 0,
                BaseClientDuration = s.Service?.ClientDurationMinutes ?? 0,
                PriceOverride = s.PriceOverride,
                SystemDurationOverride = s.SystemDurationOverride,
                ClientDurationOverride = s.ClientDurationOverride,
                // ✓ ефективні значення через методи entity
                EffectivePrice = s.GetEffectivePrice(),
                EffectiveSystemDuration = s.GetEffectiveSystemDuration(),
                EffectiveClientDuration = s.GetEffectiveClientDuration(),
            }).ToList(),
            Schedule = e.Schedules.OrderBy(s => s.DayOfWeek).Select(s => new ScheduleDto
            {
                DayOfWeek = s.DayOfWeek,
                IsWorking = s.IsWorking,
                StartTime = s.StartTime,
                EndTime = s.EndTime
            }).ToList()
        };

        private static EmployeeListItemDto MapToListItemDto(Employee e) => new()
        {
            Id = e.Id,
            FullName = e.FullName,
            Phone = e.Phone,
            AvatarUrl = e.AvatarUrl,
            Categories = e.Categories.Select(c => new CategoryShortDto
            {
                Id = c.CategoryId,
                Name = c.Category?.Name ?? string.Empty
            }).ToList(),
            IsActive = e.IsActive,
            HasUserAccount = e.UserId.HasValue,
            ServicesCount = e.Services.Count
        };
    }
}