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

namespace ERP.Services.Contracts
{
    public class SignerService : ISignerService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;
        private readonly IPdfService _pdfService;
        private readonly IStorageService _storageService;

        public SignerService(
            IUnitOfWork unitOfWork,
            IEmailService emailService,
            IConfiguration configuration,
            IPdfService pdfService,
            IStorageService storageService)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _configuration = configuration;
            _pdfService = pdfService;
            _storageService = storageService;
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

            return new SignerAuthResponseDto
            {
                AccessToken = token,
                FullName = signer.full_name,
                Email = signer.email,
                ContractId = signer.contract_id
            };
        }

        public async Task<SignDocumentResponseDto> SignDocumentAsync(SignDocumentDto dto)
        {
            try
            {
                // Validate input
                if (dto == null)
                    throw new ArgumentNullException(nameof(dto));

                if (string.IsNullOrWhiteSpace(dto.SignatureImageBase64))
                    throw new ArgumentException("Signature image is required", nameof(dto.SignatureImageBase64));

                // Get signer
                var signer = await _unitOfWork.Repository<ContractSigners>()
                    .GetByIdAsync(dto.SignerId);

                if (signer == null)
                    throw new Exception($"Signer with ID {dto.SignerId} not found");

                // Get contract
                var contract = await _unitOfWork.Repository<ERP.Entities.Models.Contracts>()
                    .AsQueryable()
                    .Include(c => c.Employee)
                    .FirstOrDefaultAsync(c => c.Id == signer.contract_id);

                if (contract == null)
                    throw new Exception("Contract not found");

                // Get the original PDF file
                byte[] pdfBytes;
                if (!string.IsNullOrWhiteSpace(contract.attachment))
                {
                    // Load from storage
                    pdfBytes = await _storageService.GetFileAsync(contract.attachment);
                }
                else
                {
                    // Generate PDF if not exists
                    pdfBytes = await _pdfService.GenerateContractPdfAsync(contract);
                }

                // Decode signature image from base64
                byte[] signatureImageBytes;
                try
                {
                    signatureImageBytes = Convert.FromBase64String(dto.SignatureImageBase64);
                }
                catch
                {
                    throw new ArgumentException("Signature image is not valid base64 format", nameof(dto.SignatureImageBase64));
                }

                // Stamp signature onto PDF
                byte[] signedPdfBytes = await _pdfService.StampSignatureAsync(
                    pdfBytes,
                    signatureImageBytes,
                    dto.PageNumber,
                    dto.X,
                    dto.Y,
                    dto.Width,
                    dto.Height);

                // Save signed PDF to storage
                string signedFileName = $"signed_{contract.Id}_{signer.Id}_{DateTime.UtcNow:yyyyMMddHHmmss}.pdf";
                string signedFilePath = await _storageService.SaveFileAsync(signedPdfBytes, signedFileName, "application/pdf");

                // Update signer record
                signer.status = "SIGNED";
                signer.signed_at = DateTime.UtcNow;
                if (!string.IsNullOrWhiteSpace(dto.Note))
                {
                    signer.note = dto.Note;
                }

                _unitOfWork.Repository<ContractSigners>().Update(signer);
                await _unitOfWork.SaveChangesAsync();

                // Create response with signed PDF as base64 for download
                string signedPdfBase64 = Convert.ToBase64String(signedPdfBytes);

                var response = new SignDocumentResponseDto
                {
                    Success = true,
                    Message = "Document signed successfully",
                    SignedPdfBase64 = signedPdfBase64,
                    DownloadUrl = $"/api/contracts/{contract.Id}/signed-pdf/{signer.Id}",
                    SignedAt = signer.signed_at.Value,
                    SignatureCount = 1
                };

                // Send confirmation email
                await SendSigningConfirmationEmail(signer, contract);

                return response;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error signing document: {ex.Message}", ex);
            }
        }

        private async Task SendSigningConfirmationEmail(ContractSigners signer, ERP.Entities.Models.Contracts contract)
        {
            try
            {
                var subject = "Xác nhận ký hợp đồng - NexaHRM";
                var body = $@"
                    <p>Chào {signer.full_name},</p>
                    <p>Chúng tôi xác nhận rằng bạn đã ký thành công hợp đồng số <strong>{contract.contract_number}</strong>.</p>
                    <p><strong>Chi tiết hợp đồng:</strong></p>
                    <ul>
                        <li>Số hợp đồng: {contract.contract_number}</li>
                        <li>Nhân viên: {contract.Employee?.full_name}</li>
                        <li>Ngày ký: {DateTime.UtcNow:dd/MM/yyyy HH:mm:ss}</li>
                    </ul>
                    <p>Tệp PDF đã ký đã được lưu trong hệ thống.</p>
                    <p>Trân trọng,<br/>Đội ngũ NexaHRM</p>
                ";

                await _emailService.SendEmailAsync(signer.email, subject, body);
            }
            catch (Exception ex)
            {
                // Log error but don't fail the signing process
                System.Diagnostics.Debug.WriteLine($"Failed to send confirmation email: {ex.Message}");
            }
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
