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
    public class SubscriptionConfiguration : IEntityTypeConfiguration<Subscription>
    {
        public void Configure(EntityTypeBuilder<Subscription> builder)
        {
            builder.ToTable("Subscriptions");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.SalonId).IsRequired();
            builder.HasIndex(x => x.SalonId).IsUnique();

            builder.Property(x => x.PaidMasterSlots).IsRequired().HasDefaultValue(0);
            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.IsActive).IsRequired();

            builder.HasOne<Salon>()
                .WithOne()
                .HasForeignKey<Subscription>(x => x.SalonId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.OwnsMany(x => x.Modules, m =>
            {
                m.ToTable("SubscriptionModules");
                m.WithOwner().HasForeignKey("SubscriptionId");
                m.HasKey(x => x.Id);
                m.Property(x => x.Id).ValueGeneratedNever();
                m.Property(x => x.Module).IsRequired();
                m.Property(x => x.AddedAt).IsRequired();
                m.Property(x => x.ExpiresAt).IsRequired();
                m.Property(x => x.Quantity).IsRequired().HasDefaultValue(1);
            });
        }
    }
}
