using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Domain.Entities;
using Microsoft.Extensions.Configuration; // Додай цей namespace
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace CRMService.Infrastructure.Security;

public class JwtTokenProvider : IJwtTokenProvider
{
    private readonly string _secret;
    private readonly string _issuer;
    private readonly string _audience;

    public JwtTokenProvider(IConfiguration configuration)
    {
        _secret = configuration["JwtSettings:Secret"]
            ?? throw new InvalidOperationException("JWT Secret is not configured.");
        _issuer = configuration["JwtSettings:Issuer"]
            ?? throw new InvalidOperationException("JWT Issuer is not configured.");
        _audience = configuration["JwtSettings:Audience"]
            ?? throw new InvalidOperationException("JWT Audience is not configured.");
    }

    public string GenerateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), // було "sub"
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.Name),
        };

        // Додаємо SalonId тільки якщо він вже є
        if (user.SalonId.HasValue)
            claims.Add(new Claim("salon_id", user.SalonId.Value.ToString()));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}