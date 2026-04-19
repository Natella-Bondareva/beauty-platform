using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Domain.Abstractions;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using CRMService.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace CRMService.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;
    private readonly IPasswordHasher _passwordHasher;

    public UserRepository(AppDbContext context, IPasswordHasher passwordHasher)
    {
        _context = context;
        _passwordHasher = passwordHasher;

    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        return await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Email == email.ToLower());
    }

    public async Task AddAsync(User user)
    {
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(User user)
    {
        _context.Users.Update(user);
        await _context.SaveChangesAsync();
    }

    public async Task<User?> GetByIdAsync(Guid id)
    {
        return await _context.Users
            .Include(x => x.Role)
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<Guid> CreateEmployeeUserAsync(string email, string fullName, string password, Guid salonId)
    {
        // 1. Перевіряємо що email ще не зайнятий
        var emailTaken = await _context.Users
            .AnyAsync(u => u.Email == email.ToLower());
        if (emailTaken)
            throw new InvalidOperationException($"Email '{email}' is already taken.");

        // 2. Знаходимо роль Employee (має бути в seed data)
        var employeeRole = await _context.Roles
            .FirstOrDefaultAsync(r => r.Name == "Employee")
            ?? throw new InvalidOperationException("Role 'Employee' not found. Check seed data.");

        // 3. Хешуємо пароль і створюємо User через фабричний метод
        var passwordHash =  _passwordHasher.Hash(password);

        // Email використовуємо як ім'я — адмін може змінити пізніше
        var nameParts = fullName.Split(' ');
        var firstName = Capitalize(nameParts.ElementAtOrDefault(0) ?? "");
        var lastName = Capitalize(nameParts.ElementAtOrDefault(1) ?? "Employee");

        var user = User.Create(
            email: email,
            passwordHash: passwordHash,
            firstName: firstName,
            lastName: lastName,
            roleId: employeeRole.Id);

        // 4. Прив'язуємо до салону одразу при створенні
        user.AssignToSalon(salonId);

        // 5. Зберігаємо
        await _context.Users.AddAsync(user);
        await _context.SaveChangesAsync();

        return user.Id;
    }

    private static string Capitalize(string s) =>
    string.IsNullOrEmpty(s) ? s : char.ToUpper(s[0]) + s[1..].ToLower();
}