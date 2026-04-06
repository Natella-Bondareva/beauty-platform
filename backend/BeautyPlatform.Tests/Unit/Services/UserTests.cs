using CRMService.Domain.Entities;
using FluentAssertions;
using Xunit;

namespace CRMService.Tests.Domain;

public class UserTests
{
    [Fact]
    public void Create_ShouldConvertEmailToLowercase()
    {
        // Arrange
        var rawEmail = "Admin@Test.COM";

        // Act
        var user = User.Create(Guid.NewGuid(), rawEmail, "hash", "FirstName", "LastName", Guid.NewGuid());

        // Assert
        user.Email.Should().Be("admin@test.com");
    }

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Create_ShouldThrowException_WhenEmailIsInvalid(string? invalidEmail)
    {
        // Act
        Action act = () => User.Create(Guid.NewGuid(), invalidEmail!, "hash", "FirstName", "LastName", Guid.NewGuid());

        // Assert
        act.Should().Throw<ArgumentException>().WithMessage("Email is required");
    }

    [Fact]
    public void Deactivate_ShouldChangeIsActiveToFalse()
    {
        // Arrange
        var user = User.Create(Guid.NewGuid(), "test@test.com", "hash", "FirstName", "LastName", Guid.NewGuid());

        // Act
        user.Deactivate();

        // Assert
        user.IsActive.Should().BeFalse();
    }
}