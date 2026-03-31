using FluentAssertions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Tests.Unit.Services
{
    public class TestServiceTests
    {
        [Fact]
        public void Should_Return_True()
        {
            // Arrange
            var value = true;

            // Act
            var result = value;

            // Assert
            result.Should().BeTrue();
        }
    }
}
    