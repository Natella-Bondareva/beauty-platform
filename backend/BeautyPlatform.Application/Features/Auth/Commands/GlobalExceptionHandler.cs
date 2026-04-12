using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Auth.Commands
{
    //public class GlobalExceptionHandler : IExceptionHandler
    //{
    //    public async ValueTask<bool> TryHandleAsync(
    //        HttpContext context,
    //        Exception exception,
    //        CancellationToken ct)
    //    {
    //        var (status, message) = exception switch
    //        {
    //            KeyNotFoundException e => (StatusCodes.Status404NotFound, e.Message),
    //            UnauthorizedAccessException e => (StatusCodes.Status403Forbidden, e.Message),
    //            InvalidOperationException e => (StatusCodes.Status409Conflict, e.Message),
    //            ArgumentException e => (StatusCodes.Status400BadRequest, e.Message),
    //            _ => (StatusCodes.Status500InternalServerError, "An unexpected error occurred.")
    //        };

    //        context.Response.StatusCode = status;
    //        await context.Response.WriteAsJsonAsync(new { error = message }, ct);
    //        return true;
    //    }
    //}
}
