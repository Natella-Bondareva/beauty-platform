using CRMService.Application.Features.BookingServices.Interfaces;
using CRMService.Domain.Entities;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRMService.Infrastructure.Repositories
{
    public class BookingFieldAnswerRepository : IBookingFieldAnswerRepository
    {
        private readonly AppDbContext _context;

        public BookingFieldAnswerRepository(AppDbContext context) => _context = context;

        public async Task<List<BookingFieldAnswer>> GetByBookingIdAsync(Guid bookingId)
            => await _context.BookingFieldAnswers
                .Include(a => a.Field)
                .Where(a => a.BookingId == bookingId)
                .ToListAsync();

        public async Task SaveAnswersAsync(Guid bookingId, IEnumerable<BookingFieldAnswer> answers)
        {
            var existing = await _context.BookingFieldAnswers
                .Where(a => a.BookingId == bookingId)
                .ToListAsync();

            _context.BookingFieldAnswers.RemoveRange(existing);
            await _context.BookingFieldAnswers.AddRangeAsync(answers);
            await _context.SaveChangesAsync();
        }
    }
}
