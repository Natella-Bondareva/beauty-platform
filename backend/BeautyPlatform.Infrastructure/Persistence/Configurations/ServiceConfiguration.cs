using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations;

public class ServiceConfiguration : IEntityTypeConfiguration<Service>
{
    public void Configure(EntityTypeBuilder<Service> builder)
    {
        builder.ToTable("Services");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.SalonId).IsRequired();
        builder.Property(x => x.CategoryId).IsRequired(); // ← FK замість string
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(1000);
        builder.Property(x => x.SystemDurationMinutes).IsRequired();
        builder.Property(x => x.ClientDurationMinutes).IsRequired();
        builder.Property(x => x.Price).IsRequired().HasColumnType("decimal(10,2)");
        builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).IsRequired();

        builder.HasOne(x => x.Salon)
            .WithMany()
            .HasForeignKey(x => x.SalonId)
            .OnDelete(DeleteBehavior.Cascade);

        // ← новий FK до категорії
        builder.HasOne(x => x.Category)
            .WithMany()
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasMany(x => x.Images)
            .WithOne(x => x.Service)
            .HasForeignKey(x => x.ServiceId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}