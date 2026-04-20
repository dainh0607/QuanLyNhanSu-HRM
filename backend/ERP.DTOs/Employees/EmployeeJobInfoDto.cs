using System;

namespace ERP.DTOs.Employees
{
    public class EmployeeJobInfoDto
    {
        public int Id { get; set; }
        public int? RegionId { get; set; }
        public int? BranchId { get; set; }
        public int? SecondaryBranchId { get; set; }
        public int? DepartmentId { get; set; }
        public int? SecondaryDepartmentId { get; set; }
        public int? JobTitleId { get; set; }
        public int? SecondaryJobTitleId { get; set; }
        public int? AccessGroupId { get; set; }
        public int? ManagerId { get; set; }
        public string? ManagerName { get; set; }
        public bool IsActive { get; set; }
        public bool IsDepartmentHead { get; set; }
    }
}
