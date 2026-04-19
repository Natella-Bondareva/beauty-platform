using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Application.Features.Employess.Interfaces
{
    public interface IImageStorageService
    {
        Task<string> UploadAsync(Stream fileStream, string fileName, string contentType);
        Task DeleteAsync(string imageUrl);
    }
}
