using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations;

public class CategoryDefaultServiceConfiguration : IEntityTypeConfiguration<CategoryDefaultService>
{
    public void Configure(EntityTypeBuilder<CategoryDefaultService> builder)
    {
        builder.ToTable("CategoryDefaultServices");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.CategoryId).IsRequired();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
        builder.Property(x => x.Description).HasMaxLength(500);
        builder.Property(x => x.SystemDurationMinutes).IsRequired();
        builder.Property(x => x.ClientDurationMinutes).IsRequired();
        builder.Property(x => x.SuggestedPrice).IsRequired().HasColumnType("decimal(10,2)");
        builder.Property(x => x.SortOrder).IsRequired().HasDefaultValue(0);
    }
}