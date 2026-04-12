using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class SalonDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Phone { get; set; }
        public AddressDto Address { get; set; }  // не рядок — зберігаємо структуру
        public string Currency { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    // Новий DTO — відображає value object
    public class AddressDto
    {
        public string Street { get; set; }
        public string City { get; set; }
    }
}
