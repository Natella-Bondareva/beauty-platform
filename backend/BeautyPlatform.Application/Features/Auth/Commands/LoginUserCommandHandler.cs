using CRMService.Application.Features.Auth.DTOs;
using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Domain.Abstractions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Commands
{
    public class LoginUserCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenProvider _jwtProvider;

        public LoginUserCommandHandler(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenProvider jwtProvider)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
            _jwtProvider = jwtProvider;
        }

        public async Task<AuthResponseDto> Handle(LoginUserCommand command)
        {
            var user = await _userRepository.GetByEmailAsync(command.Email.ToLower());

            if (user == null)
                throw new Exception("Invalid credentials");

            var isValid = user.VerifyPassword(command.Password, _passwordHasher);

            if (!isValid)
                throw new Exception("Invalid credentials");

            var token = _jwtProvider.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                Role = user.Role.Name,
                SalonId = user.SalonId,  
                UserId = user.Id
            };
        }
    }
}

