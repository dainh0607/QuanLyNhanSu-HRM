namespace ERP.DTOs.Contracts
{
    public class GenerateOtpDto
    {
        public string SignatureToken { get; set; }
    }

    public class VerifyOtpDto
    {
        public string SignatureToken { get; set; }
        public string Otp { get; set; }
    }

    public class SignerAuthResponseDto
    {
        public string AccessToken { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public int ContractId { get; set; }
    }
}
