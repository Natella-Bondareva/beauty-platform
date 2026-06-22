using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations
{
    public class SubscriptionPaymentConfiguration : IEntityTypeConfiguration<SubscriptionPayment>
    {
        public void Configure(EntityTypeBuilder<SubscriptionPayment> builder)
        {
            builder.ToTable("SubscriptionPayments");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.SalonId).IsRequired();
            builder.Property(x => x.Amount).IsRequired().HasPrecision(18, 2);
            builder.Property(x => x.Description).IsRequired().HasMaxLength(500);
            builder.Property(x => x.Status).IsRequired();
            builder.Property(x => x.CreatedAt).IsRequired();
            builder.Property(x => x.CompletedAt);
            builder.Property(x => x.Note).HasMaxLength(500);
            builder.Property(x => x.ExternalPaymentId).HasMaxLength(200);

            builder.HasIndex(x => x.SalonId);
        }
    }
}
