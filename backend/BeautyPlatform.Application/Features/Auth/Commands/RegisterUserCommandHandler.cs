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
    public class RegisterUserCommandHandler
    {
        private readonly IUserRepository _userRepository;
        private readonly IPasswordHasher _passwordHasher;

        public RegisterUserCommandHandler(
            IUserRepository userRepository,
            IPasswordHasher passwordHasher)
        {
            _userRepository = userRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<AuthResponseDto> Handle(RegisterUserCommand command)
        {
            var existingUser = await _userRepository.GetByEmailAsync(command.Email);

            if (existingUser != null)
                throw new Exception("User already exists");

            var passwordHash = _passwordHasher.Hash(command.Password);
            var roleId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            // 🔥 тимчасово (потім буде Salon creation)
            var user = User.Create(
                salonId: Guid.NewGuid(),
                email: command.Email,
                passwordHash: passwordHash,
                firstName: command.FirstName,
                lastName: command.LastName,
                roleId: roleId // потім замінимо на RoleId
            );

            await _userRepository.AddAsync(user);

            return new AuthResponseDto
            {
                Token = "", // поки пусто
                Email = user.Email,
                Role = "Administrator"
            };
        }
    }
}

