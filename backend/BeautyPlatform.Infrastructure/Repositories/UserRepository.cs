using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRMService.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context)
    {
        _context = context;
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
        await _context. SaveChangesAsync();
    }
}