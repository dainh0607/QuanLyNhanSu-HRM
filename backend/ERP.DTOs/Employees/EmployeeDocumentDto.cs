using System;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Employees
{
    public class EmployeeDocumentDto
    {
        public int Id { get; set; }
        public int EmployeeId { get; set; }
        public string DocumentName { get; set; }
        public string DocumentType { get; set; }
        public string FileUrl { get; set; }
        public long FileSize { get; set; }
        public string FileExtension { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string Note { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class DocumentUploadDto
    {
        [Required]
        public string DocumentName { get; set; }

        [Required]
        public string DocumentType { get; set; } // CV, ID_Card, Certificate, Other

        public DateTime? ExpiryDate { get; set; }

        public string Note { get; set; }
    }
}
