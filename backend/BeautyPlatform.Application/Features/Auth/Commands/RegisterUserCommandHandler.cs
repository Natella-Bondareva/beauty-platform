using CRMService.Application.Features.Auth.DTOs;
using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Domain.Abstractions;
using CRMService.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Commands
{
    // ===== REGISTER HANDLER — без salonId, з токеном =====

    public class RegisterUserCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly IRoleRepository _roleRepository;
        private readonly IPasswordHasher _passwordHasher;
        private readonly IJwtTokenProvider _jwtProvider;

        public RegisterUserCommandHandler(
            IUserRepository userRepository,
            IRoleRepository roleRepository,
            IPasswordHasher passwordHasher,
            IJwtTokenProvider jwtProvider)
        {
            _userRepository = userRepository;
            _roleRepository = roleRepository;
            _passwordHasher = passwordHasher;
            _jwtProvider = jwtProvider;
        }

        public async Task<AuthResponseDto> Handle(RegisterUserCommand command)
        {
            var existing = await _userRepository.GetByEmailAsync(command.Email);
            if (existing != null)
                throw new InvalidOperationException("User already exists.");

            // Беремо роль з БД — не хардкодимо GUID
            var role = await _roleRepository.GetByNameAsync("SalonOwner")
                ?? throw new InvalidOperationException("Role 'SalonOwner' not found.");

            var passwordHash = _passwordHasher.Hash(command.Password);

            var user = User.Create(
                email: command.Email,
                passwordHash: passwordHash,
                firstName: command.FirstName,
                lastName: command.LastName,
                roleId: role.Id
            );

            await _userRepository.AddAsync(user);

            // Повертаємо токен одразу — юзер залогінений після реєстрації
            // але HasSalon = false — фронтенд перенаправить на крок 2
            var token = _jwtProvider.GenerateToken(user);

            return new AuthResponseDto
            {
                Token = token,
                Email = user.Email,
                Role = role.Name,
                HasSalon = false
            };
        }
    }
}

