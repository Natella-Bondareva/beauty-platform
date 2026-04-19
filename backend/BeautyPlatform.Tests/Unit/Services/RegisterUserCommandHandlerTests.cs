//using Moq;
//using Xunit;
//using FluentAssertions;
//using CRMService.Application.Features.Auth.Commands;
//using CRMService.Application.Features.Auth.Interfaces;
//using CRMService.Domain.Abstractions;
//using CRMService.Domain.Entities;

//namespace CRMService.Tests.Application.Auth;

//public class RegisterUserCommandHandlerTests
//{
//    private readonly Mock<IUserRepository> _userRepositoryMock;
//    private readonly Mock<IPasswordHasher> _passwordHasherMock;
//    private readonly RegisterUserCommandHandler _handler;

//    public RegisterUserCommandHandlerTests()
//    {
//        _userRepositoryMock = new Mock<IUserRepository>();
//        _passwordHasherMock = new Mock<IPasswordHasher>();

//        _handler = new RegisterUserCommandHandler(
//            _userRepositoryMock.Object,
//            _passwordHasherMock.Object);
//    }

//    [Fact]
//    public async Task Handle_ShouldRegisterUser_WhenEmailIsUnique()
//    {
//        // Arrange
//        var command = new RegisterUserCommand
//        {
//            Email = "newuser@test.com",
//            Password = "password123",
//            FirstName = "Ivan",
//            LastName = "Ivanov"
//        };

//        // Імітуємо, що користувача з таким Email ще немає
//        _userRepositoryMock.Setup(x => x.GetByEmailAsync(command.Email))
//            .ReturnsAsync((User)null!);

//        _passwordHasherMock.Setup(x => x.Hash(command.Password))
//            .Returns("hashed_password");

//        // Act
//        var result = await _handler.Handle(command);

//        // Assert
//        result.Should().NotBeNull();
//        result.Email.Should().Be("newuser@test.com");

//        // Перевіряємо, що метод AddAsync був викликаний один раз з будь-яким об'єктом User
//        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Once);

//        // Перевіряємо, чи викликався хешер
//        _passwordHasherMock.Verify(x => x.Hash(command.Password), Times.Once);
//    }

//    [Fact]
//    public async Task Handle_ShouldThrowException_WhenUserAlreadyExists()
//    {
//        // Arrange
//        var command = new RegisterUserCommand { Email = "existing@test.com", Password = "123" };

//        // Створюємо існуючого юзера для моку
//        var existingUser = User.Create(Guid.NewGuid(), command.Email, "hash", "Fn", "Ln", Guid.NewGuid());

//        _userRepositoryMock.Setup(x => x.GetByEmailAsync(command.Email))
//            .ReturnsAsync(existingUser);

//        // Act
//        Func<Task> act = async () => await _handler.Handle(command);

//        // Assert
//        await act.Should().ThrowAsync<Exception>()
//            .WithMessage("User already exists");

//        // Перевіряємо, що AddAsync НЕ викликався, бо юзер вже є
//        _userRepositoryMock.Verify(x => x.AddAsync(It.IsAny<User>()), Times.Never);
//    }
//}