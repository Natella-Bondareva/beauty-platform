using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Infrastructure.Persistence
{
    public class AppDbContext : DbContext
    {
        public DbSet<Salon> Salons => Set<Salon>();
        public DbSet<User> Users => Set<User>();
        public DbSet<Role> Roles => Set<Role>();
        public DbSet<SpecializationCategory> SpecializationCategories => Set<SpecializationCategory>();
        public DbSet<CategoryDefaultService> CategoryDefaultServices => Set<CategoryDefaultService>();
        public DbSet<Employee> Employees => Set<Employee>();
        public DbSet<Service> Services => Set<Service>();
        public DbSet<ServiceImage> ServiceImages => Set<ServiceImage>();
        public DbSet<EmployeeService> EmployeeServices => Set<EmployeeService>();
        public DbSet<MasterSchedule> MasterSchedules => Set<MasterSchedule>();
        public DbSet<EmployeeCategory> EmployeeCategories => Set<EmployeeCategory>();
        public DbSet<EmployeeBreak> EmployeeBreaks => Set<EmployeeBreak>();
        public DbSet<Client> Clients => Set<Client>();
        public DbSet<Booking> Bookings => Set<Booking>();


        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
        }
    }
}
