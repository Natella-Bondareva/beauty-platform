using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations;

public class MasterScheduleConfiguration : IEntityTypeConfiguration<MasterSchedule>
{
    public void Configure(EntityTypeBuilder<MasterSchedule> builder)
    {
        builder.ToTable("MasterSchedules");
        builder.HasKey(x => x.Id);

        builder.Property(x => x.EmployeeId).IsRequired();
        builder.Property(x => x.DayOfWeek).IsRequired();
        builder.Property(x => x.StartTime).IsRequired();
        builder.Property(x => x.EndTime).IsRequired();
        builder.Property(x => x.IsWorking).IsRequired().HasDefaultValue(true);

        // Один запис на день для кожного майстра
        builder.HasIndex(x => new { x.EmployeeId, x.DayOfWeek }).IsUnique();

        builder.HasOne(x => x.Employee)
            .WithMany(e => e.Schedules)
            .HasForeignKey(x => x.EmployeeId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}