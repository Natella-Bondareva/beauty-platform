using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.Commands.Service_Commands
{
    public record AddServiceImageCommand(
        Stream FileStream,
        string FileName,
        string ContentType,
        bool IsCover = false
    );
}
