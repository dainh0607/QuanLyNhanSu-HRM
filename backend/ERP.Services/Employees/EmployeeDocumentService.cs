using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Employees;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Services.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERP.Services.Employees
{
    public class EmployeeDocumentService : IEmployeeDocumentService
    {
        private readonly AppDbContext _context;
        private readonly IStorageService _storageService;
        private readonly ILogger<EmployeeDocumentService> _logger;

        public EmployeeDocumentService(AppDbContext context, IStorageService storageService, ILogger<EmployeeDocumentService> logger)
        {
            _context = context;
            _storageService = storageService;
            _logger = logger;
        }

        public async Task<EmployeeDocumentDto> UploadDocumentAsync(int employeeId, DocumentUploadDto dto, Stream fileStream, string fileName, string contentType)
        {
            try
            {
                // 1. Upload to storage (Firebase or Local)
                var fileUrl = await _storageService.UploadFileAsync(fileStream, fileName, contentType);

                // 2. Create document record in DB
                var doc = new EmployeeDocuments
                {
                    EmployeeId = employeeId,
                    DocumentName = dto.DocumentName,
                    DocumentType = dto.DocumentType,
                    FileUrl = fileUrl,
                    FileSize = fileStream.Length,
                    FileExtension = Path.GetExtension(fileName),
                    ExpiryDate = dto.ExpiryDate,
                    Note = dto.Note,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.EmployeeDocuments.Add(doc);
                await _context.SaveChangesAsync();

                return MapToDto(doc);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error uploading document for employee {EmployeeId}", employeeId);
                throw;
            }
        }

        public async Task<IEnumerable<EmployeeDocumentDto>> GetEmployeeDocumentsAsync(int employeeId)
        {
            var docs = await _context.EmployeeDocuments
                .Where(d => d.EmployeeId == employeeId && d.IsActive)
                .OrderByDescending(d => d.CreatedAt)
                .ToListAsync();

            return docs.Select(MapToDto);
        }

        public async Task<bool> DeleteDocumentAsync(int documentId)
        {
            var doc = await _context.EmployeeDocuments.FindAsync(documentId);
            if (doc == null) return false;

            // Optional: delete from storage
            // await _storageService.DeleteFileAsync(doc.FileUrl);

            doc.IsActive = false; // Soft delete
            doc.UpdatedAt = DateTime.UtcNow;
            return await _context.SaveChangesAsync() > 0;
        }

        private EmployeeDocumentDto MapToDto(EmployeeDocuments doc)
        {
            return new EmployeeDocumentDto
            {
                Id = doc.Id,
                EmployeeId = doc.EmployeeId,
                DocumentName = doc.DocumentName,
                DocumentType = doc.DocumentType,
                FileUrl = doc.FileUrl,
                FileSize = doc.FileSize,
                FileExtension = doc.FileExtension,
                ExpiryDate = doc.ExpiryDate,
                Note = doc.Note,
                CreatedAt = (DateTime)doc.CreatedAt
            };
        }
    }
}
