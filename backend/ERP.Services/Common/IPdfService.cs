using System.Threading.Tasks;
using ERP.Entities.Models;

namespace ERP.Services.Common
{
    public interface IPdfService
    {
        Task<byte[]> GenerateContractPdfAsync(Entities.Models.Contracts contract);
        
        /// <summary>
        /// Stamps a signature image onto a PDF at specified coordinates
        /// </summary>
        /// <param name="pdfBytes">Original PDF file bytes</param>
        /// <param name="signatureImageBytes">Signature image bytes (PNG, JPG, etc.)</param>
        /// <param name="pageNumber">Page number to place signature (1-indexed)</param>
        /// <param name="xCoordinate">X position in points (1 point = 1/72 inch)</param>
        /// <param name="yCoordinate">Y position in points (1 point = 1/72 inch)</param>
        /// <param name="width">Width of signature image (optional, in points)</param>
        /// <param name="height">Height of signature image (optional, in points)</param>
        /// <returns>Signed PDF file bytes</returns>
        Task<byte[]> StampSignatureAsync(
            byte[] pdfBytes,
            byte[] signatureImageBytes,
            int pageNumber,
            float xCoordinate,
            float yCoordinate,
            float? width = null,
            float? height = null);
    }
}
