using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations;

public class EmployeeServiceConfiguration : IEntityTypeConfiguration<EmployeeService>
{
    public void Configure(EntityTypeBuilder<EmployeeService> builder)
    {
        builder.ToTable("EmployeeServices");

        // Composite PK
        builder.HasKey(x => new { x.EmployeeId, x.ServiceId });

        builder.Property(x => x.PriceOverride).HasColumnType("decimal(10,2)").IsRequired(false);
        builder.Property(x => x.AssignedAt).IsRequired();

        builder.HasOne(x => x.Employee)
            .WithMany(e => e.Services)
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(x => x.Service)
            .WithMany(s => s.EmployeeServices)
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}