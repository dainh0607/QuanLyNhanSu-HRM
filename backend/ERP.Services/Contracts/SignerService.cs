using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using ERP.DTOs.Auth;
using ERP.DTOs.Contracts;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using ERP.Services.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using ContractEntity = ERP.Entities.Models.Contracts;

namespace ERP.Services.Contracts
{
    public class SignerService : ISignerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IContractNotificationService _notificationService;

        public SignerService(
            IUnitOfWork unitOfWork,
            IEmailService emailService,
            IConfiguration configuration,
            IContractNotificationService notificationService)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _configuration = configuration;
            _notificationService = notificationService;
        }

        public async Task<bool> GenerateOtpAsync(GenerateOtpDto dto)
        {
            var signer = await _unitOfWork.Repository<ContractSigners>()
                .AsQueryable()
                .FirstOrDefaultAsync(s => s.signature_token == dto.SignatureToken);

            if (signer == null) throw new Exception("Mã truy cập không hợp lệ.");

            // Generate 6-digit OTP
            var otp = new Random().Next(100000, 999999).ToString();
            signer.otp_code = otp;
            signer.otp_expiry = DateTime.UtcNow.AddMinutes(10);

            _unitOfWork.Repository<ContractSigners>().Update(signer);
            await _unitOfWork.SaveChangesAsync();

            // Send Email
            var subject = "Mã xác thực ký hợp đồng NexaHRM";
            var body = $@"
                <p>Chào {signer.full_name},</p>
                <p>Mã xác thực (OTP) của bạn để truy cập và ký hợp đồng là: <strong>{otp}</strong></p>
                <p>Mã này có hiệu lực trong vòng 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                <p>Trân trọng,<br/>Đội ngũ NexaHRM</p>
            ";

            await _emailService.SendEmailAsync(signer.email, subject, body);

            return true;
        }

        public async Task<SignerAuthResponseDto> VerifyOtpAsync(VerifyOtpDto dto)
        {
            var signer = await _unitOfWork.Repository<ContractSigners>()
                .AsQueryable()
                .Include(s => s.Contract)
                .FirstOrDefaultAsync(s => s.signature_token == dto.SignatureToken);

            if (signer == null) throw new Exception("Mã truy cập không hợp lệ.");
            if (signer.otp_code != dto.Otp) throw new Exception("Mã OTP không chính xác.");
            if (signer.otp_expiry < DateTime.UtcNow) throw new Exception("Mã OTP đã hết hạn.");

            // Clear OTP after successful verification
            signer.otp_code = null;
            signer.otp_expiry = null;
            _unitOfWork.Repository<ContractSigners>().Update(signer);
            await _unitOfWork.SaveChangesAsync();

            // Generate JWT Token for Signer
            var token = GenerateSignerToken(signer);
            var assignedFields = await _unitOfWork.Repository<ContractSignerPositions>()
                .AsQueryable()
                .Where(position => position.signer_id == signer.Id)
                .OrderBy(position => position.page_number)
                .ThenBy(position => position.y_pos)
                .ThenBy(position => position.x_pos)
                .Select(position => new SignerAssignedFieldDto
                {
                    Id = position.Id,
                    Type = position.type,
                    PageNumber = position.page_number,
                    XPos = position.x_pos,
                    YPos = position.y_pos,
                    Width = position.width ?? 0.24f,
                    Height = position.height ?? 0.08f
                })
                .ToListAsync();

            return new SignerAuthResponseDto
            {
                AccessToken = token,
                SignerId = signer.Id,
                FullName = signer.full_name,
                Email = signer.email,
                ContractId = signer.contract_id,
                ContractNumber = signer.Contract?.contract_number ?? string.Empty,
                Status = signer.status,
                AssignedFields = assignedFields
            };
        }

        public async Task<CompleteSigningResponseDto> CompleteSigningAsync(int signerId, CompleteSigningDto dto)
        {
            if (dto == null) throw new Exception("Du lieu ky khong hop le.");
            if (!dto.AcceptedAgreement) throw new Exception("Vui long xac nhan dong y ky dien tu truoc khi hoan tat.");

            var signer = await _unitOfWork.Repository<ContractSigners>()
                .AsQueryable()
                .Include(item => item.Contract)
                .FirstOrDefaultAsync(item => item.Id == signerId);

            if (signer == null) throw new Exception("Khong tim thay nguoi ky.");
            if (string.Equals(signer.status, "Signed", StringComparison.OrdinalIgnoreCase))
            {
                return new CompleteSigningResponseDto
                {
                    IsCompleted = true,
                    ContractFullySigned = true,
                    NotifiedNextSigner = false
                };
            }

            var assignedPositionIds = await _unitOfWork.Repository<ContractSignerPositions>()
                .AsQueryable()
                .Where(position => position.signer_id == signerId)
                .Select(position => position.Id)
                .ToListAsync();

            if (assignedPositionIds.Count == 0)
            {
                throw new Exception("Khong tim thay vi tri ky duoc gan cho ban.");
            }

            var submittedFieldMap = (dto.Fields ?? new List<CompleteSigningFieldDto>())
                .Where(field =>
                    field.PositionId > 0 &&
                    !string.IsNullOrWhiteSpace(field.SignatureDataUrl) &&
                    !string.IsNullOrWhiteSpace(field.SignatureMethod))
                .GroupBy(field => field.PositionId)
                .ToDictionary(group => group.Key, group => group.First());

            var invalidPositionIds = submittedFieldMap.Keys.Except(assignedPositionIds).ToList();
            if (invalidPositionIds.Count > 0)
            {
                throw new Exception("Phat hien vi tri ky khong thuoc nguoi ky hien tai.");
            }

            var missingPositionIds = assignedPositionIds.Except(submittedFieldMap.Keys).ToList();
            if (missingPositionIds.Count > 0)
            {
                throw new Exception("Ban can hoan tat tat ca vi tri ky duoc gan truoc khi gui.");
            }

            signer.status = "Signed";
            signer.signed_at = DateTime.UtcNow;
            signer.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<ContractSigners>().Update(signer);
            await _unitOfWork.SaveChangesAsync();

            var hasPendingSigner = await _unitOfWork.Repository<ContractSigners>()
                .AsQueryable()
                .AnyAsync(item =>
                    item.contract_id == signer.contract_id &&
                    item.Id != signer.Id &&
                    !string.Equals(item.status, "Signed", StringComparison.OrdinalIgnoreCase));

            var notifiedNextSigner = false;
            if (hasPendingSigner)
            {
                signer.Contract.status = "PendingSignature";
                signer.Contract.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Repository<ContractEntity>().Update(signer.Contract);
                await _unitOfWork.SaveChangesAsync();

                notifiedNextSigner = await _notificationService.NotifyNextSignerAsync(signer.contract_id);
            }
            else
            {
                signer.Contract.status = "Active";
                signer.Contract.UpdatedAt = DateTime.UtcNow;
                _unitOfWork.Repository<ContractEntity>().Update(signer.Contract);
                await _unitOfWork.SaveChangesAsync();
            }

            return new CompleteSigningResponseDto
            {
                IsCompleted = true,
                ContractFullySigned = !hasPendingSigner,
                NotifiedNextSigner = notifiedNextSigner
            };
        }

        private string GenerateSignerToken(ContractSigners signer)
        {
            var claims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, signer.Id.ToString()),
                new(ClaimTypes.Email, signer.email),
                new(ClaimTypes.Name, signer.full_name),
                new("ContractId", signer.contract_id.ToString()),
                new("SignerId", signer.Id.ToString()),
                new(AuthSecurityConstants.TokenTypeClaimType, AuthSecurityConstants.SignerTokenType)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JwtSettings:Secret"] ?? "default_secret_key_at_least_32_characters_long"));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["JwtSettings:Issuer"],
                audience: _configuration["JwtSettings:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(60),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
