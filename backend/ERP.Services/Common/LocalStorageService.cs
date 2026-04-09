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
            var webRoot = string.IsNullOrEmpty(_environment.WebRootPath) ? Path.Combine(_environment.ContentRootPath, "wwwroot") : _environment.WebRootPath;
            var folderPath = Path.Combine(webRoot, UploadFolder);
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

        public async Task<string> SaveFileAsync(byte[] fileBytes, string fileName, string contentType)
        {
            var webRoot = string.IsNullOrEmpty(_environment.WebRootPath) ? Path.Combine(_environment.ContentRootPath, "wwwroot") : _environment.WebRootPath;
            var folderPath = Path.Combine(webRoot, UploadFolder);
            if (!Directory.Exists(folderPath))
            {
                Directory.CreateDirectory(folderPath);
            }

            var uniqueFileName = $"{Guid.NewGuid()}_{fileName}";
            var filePath = Path.Combine(folderPath, uniqueFileName);

            await File.WriteAllBytesAsync(filePath, fileBytes);

            var baseUrl = _configuration["AppSettings:BaseUrl"] ?? "https://localhost:5001";
            return $"{baseUrl}/{UploadFolder}/{uniqueFileName}";
        }

        public Task<bool> DeleteFileAsync(string fileUrl)
        {
            try
            {
                var fileName = Path.GetFileName(new Uri(fileUrl).LocalPath);
                var webRoot = string.IsNullOrEmpty(_environment.WebRootPath) ? Path.Combine(_environment.ContentRootPath, "wwwroot") : _environment.WebRootPath;
                var filePath = Path.Combine(webRoot, UploadFolder, fileName);

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

        public async Task<byte[]> GetFileAsync(string filePath)
        {
            try
            {
                // If filePath is a URL, extract the file name
                string actualPath;
                if (filePath.StartsWith("http://", StringComparison.OrdinalIgnoreCase) || 
                    filePath.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
                {
                    var fileName = Path.GetFileName(new Uri(filePath).LocalPath);
                    var webRoot = string.IsNullOrEmpty(_environment.WebRootPath) ? Path.Combine(_environment.ContentRootPath, "wwwroot") : _environment.WebRootPath;
                    actualPath = Path.Combine(webRoot, UploadFolder, fileName);
                }
                else
                {
                    actualPath = filePath;
                }

                if (!File.Exists(actualPath))
                {
                    throw new FileNotFoundException($"File not found: {actualPath}");
                }

                return await File.ReadAllBytesAsync(actualPath);
            }
            catch (Exception ex)
            {
                throw new Exception($"Error reading file: {ex.Message}", ex);
            }
        }
    }
}
