using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CRMService.Domain.Entities;

namespace CRMService.Application.Features.Auth.Interfaces
{
    public interface IUserRepository
    {
        Task<User?> GetByEmailAsync(string email);
        Task<User?> GetByIdAsync(Guid id);
        Task AddAsync(User user);
        Task UpdateAsync(User user);

        /// <summary>
        /// Створює обліковий запис для майстра з роллю "Employee",
        /// прив'язує до салону і повертає Id створеного User.
        /// </summary>
        Task<Guid> CreateEmployeeUserAsync(string email, string fullName, string password, Guid salonId);
    }
}
