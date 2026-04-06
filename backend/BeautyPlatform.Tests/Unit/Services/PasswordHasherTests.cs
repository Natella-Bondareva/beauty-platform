using CRMService.Infrastructure.Security;
using FluentAssertions;
using Xunit;

namespace CRMService.Tests.Infrastructure;

public class PasswordHasherTests
{
    private readonly PasswordHasher _hasher = new();

    [Fact]
    public void Hash_ShouldCreateValidHash_ThatCanBeVerified()
    {
        // Arrange
        var password = "my-secret-password";

        // Act
        var hash = _hasher.Hash(password);
        var isValid = _hasher.Verify(password, hash);

        // Assert
        isValid.Should().BeTrue();
    }

    [Fact]
    public void Hash_ShouldProduceDifferentHashes_ForSamePassword()
    {
        // Arrange
        var password = "same-password";

        // Act
        var hash1 = _hasher.Hash(password);
        var hash2 = _hasher.Hash(password);

        // Assert
        hash1.Should().NotBe(hash2, "BCrypt should use different salts for each hashing");
    }
}
