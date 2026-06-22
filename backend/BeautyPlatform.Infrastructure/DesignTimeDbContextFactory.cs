using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using CRMService.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace CRMService.Infrastructure
{
    public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();

            optionsBuilder.UseNpgsql("Host=localhost;Database=crm;Username=postgres;Password=Natella123");
            // якщо SQL Server — заміни на:
            // optionsBuilder.UseSqlServer("Server=.;Database=test;Trusted_Connection=True;");

            return new AppDbContext(optionsBuilder.Options);
        }
    }
}
