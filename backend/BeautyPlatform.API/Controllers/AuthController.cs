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
        public async Task<IActionResult> Register(RegisterUserCommand command)
        {
            try
            {
                var result = await _registerHandler.Handle(command);

                return Created("", result); // 201
            }
            catch (Exception ex)
            {
                if (ex.Message.Contains("exists"))
                    return Conflict(new { message = ex.Message }); // 409

                return BadRequest(new { message = ex.Message }); // 400
            }
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login(LoginUserCommand command)
        {
            try
            {
                var result = await _loginHandler.Handle(command);
                return Ok(result);
            }
            catch (Exception ex) // Додай параметр ex
            {
                // Це допоможе тобі побачити реальну помилку в логах сервера
                Console.WriteLine($"LOGIN ERROR: {ex.Message}");
                Console.WriteLine($"STACK TRACE: {ex.StackTrace}");

                return Unauthorized(new { message = "Invalid credentials", debug = ex.Message });
            }
        }
    }
}
