using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.SalaryModule.Interfaces;
using CRMService.Domain.Abstractions;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using CRMService.Infrastructure.Security;
using Microsoft.EntityFrameworkCore;

namespace CRMService.Infrastructure.Repositories;

public class SalaryPaymentRepository : ISalaryPaymentRepository
{
    private readonly AppDbContext _context;

    public SalaryPaymentRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<SalaryPayment?> GetByIdAsync(Guid id)
    {
        return await _context.SalaryPayments
            .FirstOrDefaultAsync(x => x.Id == id);
    }

    public async Task<List<SalaryPayment>> GetByMasterAsync(
        Guid masterId,
        DateTime? from,
        DateTime? to)
    {
        var query = _context.SalaryPayments
            .Where(x => x.MasterId == masterId);

        if (from.HasValue)
            query = query.Where(x => x.PeriodStart >= from.Value);

        if (to.HasValue)
            query = query.Where(x => x.PeriodEnd <= to.Value);

        return await query
            .OrderByDescending(x => x.PeriodStart)
            .ToListAsync();
    }

    public async Task<List<SalaryPayment>> GetBySalonAsync(
        Guid salonId,
        DateTime? from,
        DateTime? to)
    {
        var query = _context.SalaryPayments
            .Where(x => x.SalonId == salonId);

        if (from.HasValue)
            query = query.Where(x => x.PeriodStart >= from.Value);

        if (to.HasValue)
            query = query.Where(x => x.PeriodEnd <= to.Value);

        return await query
            .OrderByDescending(x => x.PeriodStart)
            .ToListAsync();
    }

    public async Task AddAsync(SalaryPayment payment)
    {
        await _context.SalaryPayments.AddAsync(payment);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(SalaryPayment payment)
    {
        await _context.SaveChangesAsync();
    }
}