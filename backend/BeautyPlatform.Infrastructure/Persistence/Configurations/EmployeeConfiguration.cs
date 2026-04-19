using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations
{
    public class EmployeeCategoryConfiguration : IEntityTypeConfiguration<EmployeeCategory>
    {
        public void Configure(EntityTypeBuilder<EmployeeCategory> builder)
        {
            builder.ToTable("EmployeeCategories");

            // Composite PK
            builder.HasKey(x => new { x.EmployeeId, x.CategoryId });

            builder.Property(x => x.AssignedAt).IsRequired();

            builder.HasOne(x => x.Employee)
                .WithMany(e => e.Categories)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(x => x.Category)
                .WithMany()
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }

    // Оновлена конфігурація Employee — без CategoryId
    public class EmployeeConfigurationV2 : IEntityTypeConfiguration<Employee>
    {
        public void Configure(EntityTypeBuilder<Employee> builder)
        {
            builder.ToTable("Employees");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.SalonId).IsRequired();
            builder.Property(x => x.UserId).IsRequired(false);
            builder.Property(x => x.FullName).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Phone).IsRequired().HasMaxLength(20);
            builder.Property(x => x.Email).HasMaxLength(256);
            builder.Property(x => x.AvatarUrl).HasMaxLength(500);
            builder.Property(x => x.HireDate).IsRequired();
            builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
            builder.Property(x => x.CreatedAt).IsRequired();

            builder.HasOne(x => x.Salon)
                .WithMany()
                .HasForeignKey(x => x.SalonId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasMany(x => x.Schedules)
                .WithOne(x => x.Employee)
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasIndex(x => new { x.SalonId, x.Email })
                .IsUnique()
                .HasFilter("\"Email\" IS NOT NULL");
        }
    }
}