using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.DTOs
{
    public class ClientStatsDto
    {
        public int TotalUnique { get; set; }
        public int NewClients { get; set; }
        public int ReturningClients { get; set; }
        public decimal RetentionRate { get; set; }  // %
    }
}
