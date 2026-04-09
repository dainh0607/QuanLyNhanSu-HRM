namespace ERP.DTOs.Contracts
{
    /// <summary>
    /// DTO for signing/stamping a document with signature image
    /// </summary>
    public class SignDocumentDto
    {
        /// <summary>
        /// The signer ID who is signing this document
        /// </summary>
        public int SignerId { get; set; }

        /// <summary>
        /// Base64 encoded signature image
        /// </summary>
        public string SignatureImageBase64 { get; set; }

        /// <summary>
        /// Page number to place signature (1-indexed, default 1)
        /// </summary>
        public int PageNumber { get; set; } = 1;

        /// <summary>
        /// X coordinate for signature placement (in points, ~72 per inch)
        /// Example: 100 = ~1.4 inches from left
        /// </summary>
        public float X { get; set; }

        /// <summary>
        /// Y coordinate for signature placement (in points, from bottom)
        /// Example: 100 = ~1.4 inches from bottom
        /// </summary>
        public float Y { get; set; }

        /// <summary>
        /// Width of signature image (in points), default auto-width
        /// </summary>
        public float? Width { get; set; } = 100;

        /// <summary>
        /// Height of signature image (in points), default auto-height
        /// </summary>
        public float? Height { get; set; } = 50;

        /// <summary>
        /// Optional signer's note about the signing
        /// </summary>
        public string Note { get; set; }
    }

    /// <summary>
    /// DTO for batch signing with multiple signers
    /// </summary>
    public class BatchSignDocumentDto
    {
        public int ContractId { get; set; }
        public List<SignDocumentDto> Signatures { get; set; }
    }

    /// <summary>
    /// Response DTO for document signing operation
    /// </summary>
    public class SignDocumentResponseDto
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        
        /// <summary>
        /// Signed PDF file as Base64 string
        /// </summary>
        public string SignedPdfBase64 { get; set; }
        
        /// <summary>
        /// Download URL for signed PDF
        /// </summary>
        public string DownloadUrl { get; set; }
        
        /// <summary>
        /// Timestamp of signing
        /// </summary>
        public DateTime SignedAt { get; set; }
        
        /// <summary>
        /// Number of signatures applied
        /// </summary>
        public int SignatureCount { get; set; }
    }
}
