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

        public SignerService(IUnitOfWork unitOfWork, IEmailService emailService, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _configuration = configuration;
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
