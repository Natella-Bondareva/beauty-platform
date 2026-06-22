using CRMService.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace CRMService.Infrastructure.Persistence.Configurations
{
    public class BookingFieldAnswerConfiguration : IEntityTypeConfiguration<BookingFieldAnswer>
    {
        public void Configure(EntityTypeBuilder<BookingFieldAnswer> builder)
        {
            builder.ToTable("BookingFieldAnswers");
            builder.HasKey(x => x.Id);
            builder.Property(x => x.Id).ValueGeneratedNever();
            builder.Property(x => x.BookingId).IsRequired();
            builder.Property(x => x.BookingFieldId).IsRequired();
            builder.Property(x => x.TextValue).HasMaxLength(2000);
            builder.Property(x => x.FileUrl).HasMaxLength(1000);

            // Відповідь → Поле (restrict: не дозволяємо видаляти поле, що має відповіді)
            builder.HasOne(a => a.Field)
                .WithMany()
                .HasForeignKey(a => a.BookingFieldId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasIndex(x => x.BookingId);
        }
    }
}
