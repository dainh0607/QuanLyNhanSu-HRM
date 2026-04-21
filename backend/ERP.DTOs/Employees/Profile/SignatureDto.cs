using System;

namespace ERP.DTOs.Employees.Profile
{
    public class SignatureDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string ImageUrl { get; set; }
        public bool IsDefault { get; set; }
        public string? CertificationInfo { get; set; }
        public string? DisplayType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }

    public class SignatureCreateDto
    {
        public string Name { get; set; }
        /// <summary>
        /// Dữ liệu Base64 của ảnh (PNG)
        /// </summary>
        public string Base64Data { get; set; }
        public bool IsDefault { get; set; }
        public string? CertificationInfo { get; set; }
        public string? DisplayType { get; set; }
        public int EmployeeId { get; set; }
    }
}
