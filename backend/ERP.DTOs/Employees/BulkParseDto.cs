using System.Collections.Generic;

namespace ERP.DTOs.Employees
{
    public class BulkParseRequestDto
    {
        public string RawText { get; set; }
        public List<int> BranchIds { get; set; }
    }

    public class BulkParseResponseDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string EmployeeCode { get; set; }
        public string PhoneNumber { get; set; }
        public string BranchName { get; set; }
    }
}
