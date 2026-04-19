using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations;

public class SpecializationCategoryConfiguration : IEntityTypeConfiguration<SpecializationCategory>
{
    public void Configure(EntityTypeBuilder<SpecializationCategory> builder)
    {
        builder.ToTable("SpecializationCategories");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.IconUrl).HasMaxLength(500);
        builder.Property(x => x.IsGlobal).IsRequired();
        builder.Property(x => x.IsActive).IsRequired().HasDefaultValue(true);
        builder.Property(x => x.CreatedAt).IsRequired();

        // SalonId може бути null (для глобальних)
        builder.Property(x => x.SalonId).IsRequired(false);

        builder.HasOne(x => x.Salon)
            .WithMany()
            .HasForeignKey(x => x.SalonId)
            .IsRequired(false)
            .OnDelete(DeleteBehavior.Cascade);

        // Унікальний індекс: не може бути двох однакових назв для одного салону
        builder.HasIndex(x => new { x.SalonId, x.Name })
            .IsUnique()
            .HasFilter("\"SalonId\" IS NOT NULL");

        builder.HasMany(x => x.DefaultServices)
            .WithOne(x => x.Category)
            .HasForeignKey(x => x.CategoryId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}