using CRMService.Application.Features.Employees.Interfaces;
using CRMService.Application.Features.Employess.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace CRMService.Infrastructure.Storage
{
    public class CloudinaryImageStorageService : IImageStorageService
    {
        private readonly Cloudinary _cloudinary;
        private const string Folder = "service-images";

        public CloudinaryImageStorageService(Cloudinary cloudinary)
        {
            _cloudinary = cloudinary;
        }

        public async Task<string> UploadAsync(Stream fileStream, string fileName, string contentType)
        {
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(fileName, fileStream),
                Folder = Folder,
                // Автоматично оптимізує розмір і формат
                Transformation = new Transformation()
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error is not null)
                throw new InvalidOperationException($"Cloudinary upload failed: {result.Error.Message}");

            // Повертаємо публічний URL зображення
            return result.SecureUrl.ToString();
        }

        public async Task DeleteAsync(string imageUrl)
        {
            // Дістаємо PublicId з URL
            // URL виглядає так: https://res.cloudinary.com/cloud/image/upload/v123/service-images/filename.jpg
            var publicId = ExtractPublicId(imageUrl);
            if (publicId is null) return;

            var deleteParams = new DeletionParams(publicId);
            await _cloudinary.DestroyAsync(deleteParams);
        }

        private static string? ExtractPublicId(string imageUrl)
        {
            try
            {
                var uri = new Uri(imageUrl);
                var path = uri.AbsolutePath; // /image/upload/v123/service-images/filename.jpg

                // Знаходимо частину після /upload/
                var uploadIndex = path.IndexOf("/upload/", StringComparison.Ordinal);
                if (uploadIndex < 0) return null;

                var afterUpload = path[(uploadIndex + 8)..]; // v123/service-images/filename.jpg

                // Прибираємо версію (v123/)
                if (afterUpload.StartsWith('v'))
                {
                    var slashIndex = afterUpload.IndexOf('/');
                    if (slashIndex >= 0)
                        afterUpload = afterUpload[(slashIndex + 1)..]; // service-images/filename.jpg
                }

                // Прибираємо розширення файлу
                var dotIndex = afterUpload.LastIndexOf('.');
                if (dotIndex >= 0)
                    afterUpload = afterUpload[..dotIndex]; // service-images/filename

                return afterUpload;
            }
            catch
            {
                return null;
            }
        }
    }
}