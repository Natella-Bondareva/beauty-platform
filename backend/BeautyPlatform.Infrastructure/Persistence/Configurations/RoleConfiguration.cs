using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations;

public class RoleConfiguration : IEntityTypeConfiguration<Role>
{
    public void Configure(EntityTypeBuilder<Role> builder)
    {
        builder.HasKey(x => x.Id);
        builder.Property(x => x.Name)
            .IsRequired()
            .HasMaxLength(50);
        builder.HasIndex(x => x.Name).IsUnique();

        // Seed — ролі завжди є в базі після міграції
        builder.HasData(
            new { Id = Guid.Parse("11111111-1111-1111-1111-111111111111"), Name = "SalonOwner" },
            new { Id = Guid.Parse("22222222-2222-2222-2222-222222222222"), Name = "Master" }
        );
    }
}