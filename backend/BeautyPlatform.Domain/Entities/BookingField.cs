using CRMService.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
public class BookingField
{
    public Guid Id { get; private set; }
    public Guid SalonId { get; private set; }
    public string Label { get; private set; } = null!;        
    public string? Placeholder { get; private set; }          
    public FieldType Type { get; private set; }
    public FieldScope Scope { get; private set; }
    public Guid? TargetId { get; private set; }               
    public bool IsRequired { get; private set; }
    public int Order { get; private set; }                    
    public bool IsActive { get; private set; }

    private readonly List<BookingFieldOption> _options = new();
    public IReadOnlyCollection<BookingFieldOption> Options => _options; 

    private BookingField() { }

    public static BookingField Create(
        Guid salonId,
        string label,
        FieldType type,
        FieldScope scope,
        bool isRequired,
        int order,
        Guid? targetId = null,
        string? placeholder = null)
    {
        if (string.IsNullOrWhiteSpace(label))
            throw new ArgumentException("Label is required.");
        if (scope != FieldScope.Salon && targetId == null)
            throw new ArgumentException("TargetId is required for Service or Master scope.");

        return new BookingField
        {
            Id = Guid.NewGuid(),
            SalonId = salonId,
            Label = label,
            Placeholder = placeholder,
            Type = type,
            Scope = scope,
            TargetId = targetId,
            IsRequired = isRequired,
            Order = order,
            IsActive = true
        };
    }

    public void AddOption(string value)
    {
        if (Type != FieldType.Select)
            throw new InvalidOperationException("Options only for Select type.");
        _options.Add(new BookingFieldOption(Id, value));
    }

    public void Update(string label, bool isRequired, string? placeholder)
    {
        if (string.IsNullOrWhiteSpace(label))
            throw new ArgumentException("Label is required.");
        Label = label;
        IsRequired = isRequired;
        Placeholder = placeholder;
    }

    public void Deactivate() => IsActive = false;
}

// Варіанти для Select типу
public class BookingFieldOption
{
    public Guid Id { get; private set; }
    public Guid BookingFieldId { get; private set; }
    public string Value { get; private set; } = null!;

    private BookingFieldOption() { }

    public BookingFieldOption(Guid fieldId, string value)
    {
        Id = Guid.NewGuid();
        BookingFieldId = fieldId;
        Value = value;
    }
}
}
