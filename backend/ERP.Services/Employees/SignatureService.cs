using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Employees.Profile;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using ERP.Services.Common;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Employees
{
    public class SignatureService : ISignatureService
    {
        private readonly IUnitOfWork _uow;
        private readonly AppDbContext _context;
        private readonly IStorageService _storageService;

        public SignatureService(IUnitOfWork uow, AppDbContext context, IStorageService storageService)
        {
            _uow = uow;
            _context = context;
            _storageService = storageService;
        }

        public async Task<IEnumerable<SignatureDto>> GetSignaturesByEmployeeIdAsync(int employeeId)
        {
            return await _context.DigitalSignatures
                .Where(s => s.employee_id == employeeId)
                .OrderByDescending(s => s.CreatedAt)
                .Select(s => new SignatureDto
                {
                    Id = s.Id,
                    Name = s.signature_name,
                    ImageUrl = s.signature_data,
                    IsDefault = s.is_default,
                    CertificationInfo = s.certification_info,
                    DisplayType = s.display_type,
                    CreatedAt = s.CreatedAt,
                    UpdatedAt = s.UpdatedAt
                })
                .ToListAsync();
        }

        public async Task<bool> CreateSignatureAsync(SignatureCreateDto dto)
        {
            // 1. Process Base64 image
            if (string.IsNullOrEmpty(dto.Base64Data)) throw new Exception("Dữ liệu chữ ký trống.");
            
            var base64Part = dto.Base64Data;
            if (base64Part.Contains(","))
            {
                base64Part = base64Part.Split(',')[1];
            }

            byte[] imageBytes = Convert.FromBase64String(base64Part);
            
            // 2. Upload to storage
            string fileName = $"signatures/{dto.EmployeeId}/{Guid.NewGuid()}.png";
            string imageUrl = await _storageService.SaveFileAsync(imageBytes, fileName, "image/png");

            // 3. Handle default logic
            if (dto.IsDefault)
            {
                await ResetDefaultsAsync(dto.EmployeeId);
            }

            // 4. Save to DB
            var signature = new DigitalSignatures
            {
                employee_id = dto.EmployeeId,
                signature_name = dto.Name,
                signature_data = imageUrl,
                is_default = dto.IsDefault,
                certification_info = dto.CertificationInfo,
                display_type = dto.DisplayType,
                tenant_id = _context.Employees.Where(e => e.Id == dto.EmployeeId).Select(e => e.tenant_id).FirstOrDefault()
            };

            _context.DigitalSignatures.Add(signature);
            return await _uow.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteSignatureAsync(int id)
        {
            var s = await _context.DigitalSignatures.FindAsync(id);
            if (s == null) return false;

            // Delete file
            if (!string.IsNullOrEmpty(s.signature_data))
            {
                await _storageService.DeleteFileAsync(s.signature_data);
            }

            _context.DigitalSignatures.Remove(s);
            return await _uow.SaveChangesAsync() > 0;
        }

        public async Task<bool> SetDefaultSignatureAsync(int id, int employeeId)
        {
            var target = await _context.DigitalSignatures.FirstOrDefaultAsync(s => s.Id == id && s.employee_id == employeeId);
            if (target == null) return false;

            await ResetDefaultsAsync(employeeId);
            
            target.is_default = true;
            target.UpdatedAt = DateTime.UtcNow;
            _context.DigitalSignatures.Update(target);
            
            return await _uow.SaveChangesAsync() > 0;
        }

        private async Task ResetDefaultsAsync(int employeeId)
        {
            var defaults = await _context.DigitalSignatures
                .Where(s => s.employee_id == employeeId && s.is_default)
                .ToListAsync();

            foreach (var s in defaults)
            {
                s.is_default = false;
                s.UpdatedAt = DateTime.UtcNow;
                _context.DigitalSignatures.Update(s);
            }
        }
    }
}
