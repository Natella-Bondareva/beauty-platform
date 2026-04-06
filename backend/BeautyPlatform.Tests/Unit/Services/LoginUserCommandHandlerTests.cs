using Moq;
using Xunit;
using FluentAssertions;
using CRMService.Application.Features.Auth.Commands;
using CRMService.Application.Features.Auth.Interfaces;
using CRMService.Application.Features.Auth.DTOs;
using CRMService.Domain.Abstractions;
using CRMService.Domain.Entities;

namespace CRMService.Tests.Unit.Services;

public class LoginUserCommandHandlerTests
{
    private readonly Mock<IUserRepository> _userRepositoryMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly Mock<IJwtTokenProvider> _jwtProviderMock;
    private readonly LoginUserCommandHandler _handler;

    public LoginUserCommandHandlerTests()
    {
        // Створюємо моки для залежностей
        _userRepositoryMock = new Mock<IUserRepository>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        _jwtProviderMock = new Mock<IJwtTokenProvider>();

        // Ініціалізуємо хендлер з моками
        _handler = new LoginUserCommandHandler(
            _userRepositoryMock.Object,
            _passwordHasherMock.Object,
            _jwtProviderMock.Object);
    }

    [Fact]
    public async Task Handle_ShouldReturnAuthResponse_WhenCredentialsAreValid()
    {
        // Arrange (Налаштування даних)
        var command = new LoginUserCommand { Email = "test@example.com", Password = "password123" };

        // Створюємо тестового юзера через Reflection або Factory Method
        // Важливо: переконайся, що роль не null, бо хендлер звертається до user.Role.Name
        var user = User.Create(
            Guid.NewGuid(),
            "test@example.com",
            "hashed_password",
            "John",
            "Doe",
            Guid.NewGuid()
        );
        // Якщо роль завантажується окремо, може знадобитися налаштування навігаційної властивості

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(x => x.Verify(command.Password, user.PasswordHash))
            .Returns(true);

        _jwtProviderMock.Setup(x => x.GenerateToken(user))
            .Returns("fake-jwt-token");

        // Act (Виконання)
        var result = await _handler.Handle(command);

        // Assert (Перевірка результату)
        result.Should().NotBeNull();
        result.Token.Should().Be("fake-jwt-token");
        result.Email.Should().Be(user.Email);

        _jwtProviderMock.Verify(x => x.GenerateToken(user), Times.Once);
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenPasswordIsInvalid()
    {
        // Arrange
        var command = new LoginUserCommand { Email = "test@example.com", Password = "wrong_password" };
        var user = User.Create(Guid.NewGuid(), "test@example.com", "hash", "Name", "Surname", Guid.NewGuid());

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync(user);

        _passwordHasherMock.Setup(x => x.Verify(It.IsAny<string>(), It.IsAny<string>()))
            .Returns(false); // Пароль невірний

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command));
    }

    [Fact]
    public async Task Handle_ShouldThrowException_WhenUserDoesNotExist()
    {
        // Arrange
        var command = new LoginUserCommand { Email = "nonexistent@example.com", Password = "any" };

        _userRepositoryMock.Setup(x => x.GetByEmailAsync(It.IsAny<string>()))
            .ReturnsAsync((User)null!); // Юзера не знайдено

        // Act & Assert
        await Assert.ThrowsAsync<Exception>(() => _handler.Handle(command));
    }
}