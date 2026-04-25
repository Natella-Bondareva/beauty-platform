using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Infrastructure.Persistence.Configurations
{
    public class ClientConfiguration : IEntityTypeConfiguration<Client>
    {
        public void Configure(EntityTypeBuilder<Client> builder)
        {
            builder.ToTable("Clients");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.SalonId).IsRequired();
            builder.Property(x => x.Phone).IsRequired().HasMaxLength(20);
            builder.Property(x => x.FirstName).HasMaxLength(100);
            builder.Property(x => x.LastName).HasMaxLength(100);
            builder.Property(x => x.NoShowCount).IsRequired().HasDefaultValue(0);
            builder.Property(x => x.CreatedAt).IsRequired();

            // Унікальний клієнт по телефону в межах салону
            builder.HasIndex(x => new { x.SalonId, x.Phone }).IsUnique();

            builder.HasOne(x => x.Salon)
                .WithMany()
                .HasForeignKey(x => x.SalonId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
