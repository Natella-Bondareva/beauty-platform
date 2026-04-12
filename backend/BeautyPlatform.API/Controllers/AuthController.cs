using CRMService.Application.Features.Auth.Commands;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CRMService.API.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly RegisterUserCommandHandler _registerHandler;
        private readonly LoginUserCommandHandler _loginHandler;

        public AuthController(
            RegisterUserCommandHandler registerHandler,
            LoginUserCommandHandler loginHandler)
        {
            _registerHandler = registerHandler;
            _loginHandler = loginHandler;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register(RegisterUserCommand command)
        {
            var result = await _registerHandler.Handle(command);
            return Created("", result);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginUserCommand command)
        {
            var result = await _loginHandler.Handle(command);
            return Ok(result);
        }
    }
}
