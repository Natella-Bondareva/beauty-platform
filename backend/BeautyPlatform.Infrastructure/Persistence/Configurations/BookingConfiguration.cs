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
    public class BookingConfiguration : IEntityTypeConfiguration<Booking>
    {
        public void Configure(EntityTypeBuilder<Booking> builder)
        {
            builder.ToTable("Bookings");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.SalonId).IsRequired();
            builder.Property(x => x.ClientId).IsRequired();
            builder.Property(x => x.EmployeeId).IsRequired();
            builder.Property(x => x.ServiceId).IsRequired();
            builder.Property(x => x.Status).IsRequired();
            builder.Property(x => x.StartTimeUtc).IsRequired();
            builder.Property(x => x.EndTimeUtc).IsRequired();
            builder.Property(x => x.Price).IsRequired().HasColumnType("decimal(10,2)");
            builder.Property(x => x.ExpiresAt).IsRequired();
            builder.Property(x => x.CancellationReason).HasMaxLength(500);
            builder.Property(x => x.CreatedAt).IsRequired();

            builder.HasOne(x => x.Salon)
                .WithMany()
                .HasForeignKey(x => x.SalonId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Client)
                .WithMany(c => c.Bookings)
                .HasForeignKey(x => x.ClientId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Employee)
                .WithMany()
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(x => x.Service)
                .WithMany()
                .HasForeignKey(x => x.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);

            // Індекс для перевірки слотів — найчастіший запит
            builder.HasIndex(x => new { x.EmployeeId, x.StartTimeUtc, x.Status });
            builder.HasIndex(x => new { x.SalonId, x.StartTimeUtc });
        }
    }
}
