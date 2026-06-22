using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
public class BookingFieldAnswer
{
    public Guid Id { get; private set; }
    public Guid BookingId { get; private set; }
    public Guid BookingFieldId { get; private set; }
    public string? TextValue { get; private set; }     
    public string? FileUrl { get; private set; }       

    public BookingField Field { get; private set; } = default!;

    private BookingFieldAnswer() { }

    public static BookingFieldAnswer Create(
        Guid bookingId,
        Guid bookingFieldId,
        string? textValue,
        string? fileUrl)
    {
        return new BookingFieldAnswer
        {
            Id = Guid.NewGuid(),
            BookingId = bookingId,
            BookingFieldId = bookingFieldId,
            TextValue = textValue,
            FileUrl = fileUrl
        };
    }
}
}
