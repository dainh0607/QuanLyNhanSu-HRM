namespace ERP.DTOs.Employees
{
    public class EmployeeSearchDto
    {
        public int Id { get; set; }
        public string FullName { get; set; }
        public string EmployeeCode { get; set; }
        public string? Avatar { get; set; }
        public string? DepartmentName { get; set; }
        public string? JobTitleName { get; set; }
    }
}
