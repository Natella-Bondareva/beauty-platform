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
    public class EmployeeBreakConfiguration : IEntityTypeConfiguration<EmployeeBreak>
    {
        public void Configure(EntityTypeBuilder<EmployeeBreak> builder)
        {
            builder.ToTable("EmployeeBreaks");
            builder.HasKey(x => x.Id);

            builder.Property(x => x.EmployeeId).IsRequired();
            builder.Property(x => x.Date).IsRequired();
            builder.Property(x => x.StartTime).IsRequired();
            builder.Property(x => x.EndTime).IsRequired();
            builder.Property(x => x.Reason).HasMaxLength(200);
            builder.Property(x => x.CreatedAt).IsRequired();

            builder.HasOne(x => x.Employee)
                .WithMany()
                .HasForeignKey(x => x.EmployeeId)
                .OnDelete(DeleteBehavior.Cascade);

            // Індекс для швидкого пошуку по даті
            builder.HasIndex(x => new { x.EmployeeId, x.Date });
        }
    }
}
