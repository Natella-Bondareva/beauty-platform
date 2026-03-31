using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Interfaces
{
    public interface IJwtTokenProvider
    {
        string GenerateToken(User user);
    }
}
