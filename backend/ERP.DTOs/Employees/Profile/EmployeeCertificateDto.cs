using System;

namespace ERP.DTOs.Employees.Profile
{
    public class EmployeeCertificateDto
    {
        public int CertificateId { get; set; }
        public string CertificateName { get; set; }
        public string CertificateCode { get; set; }
        public DateTime? IssueDate { get; set; }
        public string Attachment { get; set; }
    }
}
