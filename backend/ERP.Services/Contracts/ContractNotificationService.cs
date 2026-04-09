using System;
using System.Linq;
using System.Threading.Tasks;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using ERP.Services.Common;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace ERP.Services.Contracts
{
    public class ContractNotificationService : IContractNotificationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _configuration;

        public ContractNotificationService(IUnitOfWork unitOfWork, IEmailService emailService, IConfiguration configuration)
        {
            _unitOfWork = unitOfWork;
            _emailService = emailService;
            _configuration = configuration;
        }

        public async Task<bool> NotifySignerAsync(int signerId)
        {
            var signer = await _unitOfWork.Repository<ContractSigners>()
                .AsQueryable()
                .Include(s => s.Contract)
                .FirstOrDefaultAsync(s => s.Id == signerId);

            if (signer == null) return false;

            // Generate Token if not exists
            if (string.IsNullOrEmpty(signer.signature_token))
            {
                signer.signature_token = Guid.NewGuid().ToString();
            }

            signer.status = "Sending";

            var frontendUrl = (_configuration["Frontend:BaseUrl"] ?? "http://localhost:5173").TrimEnd('/');
            var signUrl = $"{frontendUrl}/contracts/signing/{signer.signature_token}";

            var subject = $"Yêu cầu ký hợp đồng: {signer.Contract?.contract_number}";
            var body = $@"
                <p>Chào {signer.full_name},</p>
                <p>Bạn có một yêu cầu ký hợp đồng điện tử <strong>{signer.Contract?.contract_number}</strong> từ hệ thống NexaHRM.</p>
                <p>Vui lòng truy cập đường dẫn sau để xem và xác thực (OTP) trước khi thực hiện ký duyệt:</p>
                <p><a href='{signUrl}'>{signUrl}</a></p>
                <p>Trân trọng,<br/>Đội ngũ NexaHRM</p>
            ";

            await _emailService.SendEmailAsync(signer.email, subject, body);
            
            signer.status = "Sent";
            _unitOfWork.Repository<ContractSigners>().Update(signer);
            await _unitOfWork.SaveChangesAsync();

            return true;
        }

        public async Task<bool> NotifyNextSignerAsync(int contractId)
        {
            var nextSigner = await _unitOfWork.Repository<ContractSigners>()
                .AsQueryable()
                .Where(s => s.contract_id == contractId && (s.status == "Pending" || s.status == "Draft"))
                .OrderBy(s => s.sign_order)
                .FirstOrDefaultAsync();

            if (nextSigner == null) return false;

            return await NotifySignerAsync(nextSigner.Id);
        }
    }
}
