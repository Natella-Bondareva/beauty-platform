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

    // Впроваджуємо IConfiguration через конструктор
    public JwtTokenProvider(IConfiguration configuration)
    {
        // "JwtSettings:Secret" — це шлях до ключа в ієрархії JSON
        _secret = configuration["JwtSettings:Secret"]
                  ?? throw new InvalidOperationException("JWT Secret key is not configured.");
    }

    public string GenerateToken(User user)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Role, user.Role.Name),
            new Claim("SalonId", user.SalonId.ToString())
        };

        // Тепер використовуємо _secret, отриманий з конфігурації
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_secret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            // Не забудь додати Issuer та Audience, якщо ти їх перевіряєш у Middleware
            expires: DateTime.UtcNow.AddMinutes(30),
            claims: claims,
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}