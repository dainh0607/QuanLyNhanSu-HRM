using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;

namespace ERP.Services.Common
{
    public class LocalStorageService : IStorageService
    {
        private readonly IWebHostEnvironment _environment;
        private readonly IConfiguration _configuration;
        private const string UploadFolder = "uploads";

        public LocalStorageService(IWebHostEnvironment environment, IConfiguration configuration)
        {
            _environment = environment;
            _configuration = configuration;
        }

        public async Task<string> UploadFileAsync(Stream fileStream, string fileName, string contentType)
        {
            var folderPath = Path.Combine(_environment.WebRootPath, UploadFolder);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            using (var localFileStream = new FileStream(filePath, FileMode.Create))
            {
                await fileStream.CopyToAsync(localFileStream);
            }

            var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "https://localhost:5001";
            return $"{baseUrl}/{UploadFolder}/{uniqueFileName}";
        }

        public Task<bool> DeleteFileAsync(string fileUrl)
        {
            try
            {
                var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
                var filePath = Path.Combine(_environment.WebRootPath, UploadFolder, fileName);

                if (File.Exists(filePath))
                {
                    File.Delete(filePath);
                    return Task.FromResult(true);
                }
                return Task.FromResult(false);
            }
            catch
            {
                return Task.FromResult(false);
            }
        }
    }
}
