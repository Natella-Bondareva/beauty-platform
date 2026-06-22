using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.SalaryModule.Interfaces;
using CRMService.Domain.Abstractions;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using CRMService.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace CRMService.Infrastructure.Repositories;

public class ContractRepository : IContractRepository
{
    private readonly AppDbContext _context;

    public ContractRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<MasterContract?> GetByIdAsync(Guid id)
    {
        return await _context.MasterContracts
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<MasterContract?> GetActiveByMasterIdAsync(Guid masterId)
    {
        return await _context.MasterContracts
            .FirstOrDefaultAsync(x => x.MasterId == masterId && x.IsActive);
    }

    public async Task<List<MasterContract>> GetActiveBySalonIdAsync(Guid salonId)
    {
        return await _context.MasterContracts
            .Where(x => x.SalonId == salonId && x.IsActive)
            .ToListAsync();
    }

    public async Task AddAsync(MasterContract contract)
    {
        await _context.MasterContracts.AddAsync(contract);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(MasterContract contract)
    {
        await _context.SaveChangesAsync();
    }
}