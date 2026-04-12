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
    public class SalonConfiguration : IEntityTypeConfiguration<Salon>
    {
        public void Configure(EntityTypeBuilder<Salon> builder)
        {
            builder.ToTable("Salons");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.OwnerId).IsRequired();
            builder.HasIndex(x => x.OwnerId).IsUnique();
            builder.Property(x => x.Name).IsRequired().HasMaxLength(200);
            builder.Property(x => x.Phone).IsRequired().HasMaxLength(20);

            builder.OwnsOne(x => x.Address, a =>
            {
                a.Property(x => x.Street).HasColumnName("Street").IsRequired().HasMaxLength(300);
                a.Property(x => x.City).HasColumnName("City").IsRequired().HasMaxLength(100);
            });

            builder.Property(x => x.Currency).IsRequired().HasMaxLength(3).HasDefaultValue("UAH");
            builder.Property(x => x.CreatedAt).IsRequired();

            builder.OwnsOne(x => x.Settings, s =>
            {
                s.ToTable("SalonSettings");
                s.HasKey(x => x.Id);
                s.Property(x => x.SalonId).IsRequired();
                s.Property(x => x.OpeningTime).IsRequired();
                s.Property(x => x.ClosingTime).IsRequired();
                s.Property(x => x.DefaultSlotDurationMinutes).IsRequired().HasDefaultValue(60);
                s.Property(x => x.Timezone).IsRequired().HasMaxLength(50).HasDefaultValue("Europe/Kyiv");

                s.OwnsMany(x => x.BreakTimes, b =>
                {
                    b.ToTable("SalonBreakTimes");
                    b.WithOwner().HasForeignKey("SalonSettingsId");
                    b.Property<int>("Id").ValueGeneratedOnAdd();
                    b.HasKey("Id");
                    b.Property(x => x.Start).IsRequired();
                    b.Property(x => x.End).IsRequired();
                });

                s.OwnsMany(x => x.RegularDaysOff, r =>
                {
                    r.ToTable("SalonRegularDaysOff");
                    r.WithOwner().HasForeignKey("SalonSettingsId");
                    r.HasKey(x => x.Id);
                    r.Property(x => x.Id).ValueGeneratedNever(); // додай цей рядок
                    r.Property(x => x.DayOfWeek).IsRequired();
                });

                s.OwnsMany(x => x.SpecialDaysOff, d =>
                {
                    d.ToTable("SalonSpecialDaysOff");
                    d.WithOwner().HasForeignKey("SalonSettingsId");
                    d.HasKey(x => x.Id);
                    d.Property(x => x.Id).ValueGeneratedNever(); // додай цей рядок
                    d.Property(x => x.Date).IsRequired();
                    d.Property(x => x.Reason).HasMaxLength(200);
                });
            });
        }
    }
}
