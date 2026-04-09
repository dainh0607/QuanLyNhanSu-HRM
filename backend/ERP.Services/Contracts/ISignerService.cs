using System.Threading.Tasks;
using ERP.DTOs.Contracts;

namespace ERP.Services.Contracts
{
    public interface ISignerService
    {
        Task<bool> GenerateOtpAsync(GenerateOtpDto dto);
        Task<SignerAuthResponseDto> VerifyOtpAsync(VerifyOtpDto dto);
        
        /// <summary>
        /// Signs/stamps a PDF document with a signature image at specified coordinates
        /// </summary>
        Task<SignDocumentResponseDto> SignDocumentAsync(SignDocumentDto dto);
    }
}
