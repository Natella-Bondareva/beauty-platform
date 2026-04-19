using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations;

public class ServiceImageConfiguration : IEntityTypeConfiguration<ServiceImage>
{
    public void Configure(EntityTypeBuilder<ServiceImage> builder)
    {
        builder.ToTable("ServiceImages");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.ServiceId).IsRequired();
        builder.Property(x => x.ImageUrl).IsRequired().HasMaxLength(500);
        builder.Property(x => x.IsCover).IsRequired().HasDefaultValue(false);
        builder.Property(x => x.SortOrder).IsRequired().HasDefaultValue(0);
        builder.Property(x => x.UploadedAt).IsRequired();
    }
}