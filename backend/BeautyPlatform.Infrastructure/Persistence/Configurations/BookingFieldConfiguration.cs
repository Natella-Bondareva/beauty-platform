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
    public class BookingFieldConfiguration : IEntityTypeConfiguration<BookingField>
    {
        public void Configure(EntityTypeBuilder<BookingField> builder)
        {
            builder.ToTable("BookingFields");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.SalonId).IsRequired();
            builder.Property(x => x.Label).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Placeholder).HasMaxLength(500);
            builder.Property(x => x.Type).IsRequired();
            builder.Property(x => x.Scope).IsRequired();
            builder.Property(x => x.IsRequired).IsRequired();
            builder.Property(x => x.Order).IsRequired();
            builder.Property(x => x.IsActive).IsRequired();

            builder.OwnsMany(x => x.Options, o =>
            {
                o.ToTable("BookingFieldOptions");
                o.WithOwner().HasForeignKey("BookingFieldId");
                o.HasKey(x => x.Id);
                o.Property(x => x.Id).ValueGeneratedNever();
                o.Property(x => x.Value).IsRequired().HasMaxLength(200);
            });
        }
    }
}
