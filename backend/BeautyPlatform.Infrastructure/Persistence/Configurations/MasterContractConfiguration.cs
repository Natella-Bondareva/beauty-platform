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
    public class MasterContractConfiguration : IEntityTypeConfiguration<MasterContract>
    {
        public void Configure(EntityTypeBuilder<MasterContract> builder)
        {
            builder.ToTable("MasterContracts");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.MasterId).IsRequired();
            builder.Property(x => x.SalonId).IsRequired();
            builder.Property(x => x.Type).IsRequired();
            builder.Property(x => x.Amount).IsRequired().HasPrecision(18, 2);
            builder.Property(x => x.PaymentPeriodDays).IsRequired();
            builder.Property(x => x.StartedAt).IsRequired();
            builder.Property(x => x.IsActive).IsRequired();
        }
    }

    public class SalaryPaymentConfiguration : IEntityTypeConfiguration<SalaryPayment>
    {
        public void Configure(EntityTypeBuilder<SalaryPayment> builder)
        {
            builder.ToTable("SalaryPayments");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.MasterId).IsRequired();
            builder.Property(x => x.SalonId).IsRequired();
            builder.Property(x => x.ContractId).IsRequired();
            builder.Property(x => x.PeriodStart).IsRequired();
            builder.Property(x => x.PeriodEnd).IsRequired();
            builder.Property(x => x.EarnedAmount).IsRequired().HasPrecision(18, 2);
            builder.Property(x => x.ForecastAmount).IsRequired().HasPrecision(18, 2);
            builder.Property(x => x.Status).IsRequired();
            builder.Property(x => x.Note).HasMaxLength(500);
        }
    }
}
