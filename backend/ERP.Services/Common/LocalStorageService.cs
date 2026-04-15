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
                var actualPath = ResolveStoragePath(filePath);

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

        private string ResolveStoragePath(string filePath)
        {
            if (string.IsNullOrWhiteSpace(filePath))
            {
                throw new ArgumentException("File path cannot be empty.", nameof(filePath));
            }

            var webRoot = string.IsNullOrEmpty(_environment.WebRootPath)
                ? Path.Combine(_environment.ContentRootPath, "wwwroot")
                : _environment.WebRootPath;

            if (Uri.TryCreate(filePath, UriKind.Absolute, out var absoluteUri))
            {
                var fileName = Path.GetFileName(absoluteUri.LocalPath);
                return Path.Combine(webRoot, UploadFolder, fileName);
            }

            if (Path.IsPathRooted(filePath) && File.Exists(filePath))
            {
                return filePath;
            }

            var normalizedPath = filePath
                .Trim()
                .TrimStart('~')
                .TrimStart('/', '\\')
                .Replace('/', Path.DirectorySeparatorChar)
                .Replace('\\', Path.DirectorySeparatorChar);

            if (normalizedPath.StartsWith($"{UploadFolder}{Path.DirectorySeparatorChar}", StringComparison.OrdinalIgnoreCase))
            {
                return Path.Combine(webRoot, normalizedPath);
            }

            return Path.Combine(webRoot, UploadFolder, Path.GetFileName(normalizedPath));
        }
    }
}
