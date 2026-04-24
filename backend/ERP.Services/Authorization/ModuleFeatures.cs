using System.Collections.Generic;

namespace ERP.Services.Authorization
{
    public class ModuleInfo
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public List<FeatureInfo> Features { get; set; }
    }

    public class FeatureInfo
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string? Description { get; set; }
    }

    public static class ModuleFeatures
    {
        public static readonly List<ModuleInfo> Modules = new List<ModuleInfo>
        {
            new ModuleInfo
            {
                Code = "DASHBOARD",
                Name = "Dashboard",
                Features = new List<FeatureInfo>
                {
                    new FeatureInfo { Code = "DASHBOARD_VIEW", Name = "Xem Dashboard tổng quan" },
                    new FeatureInfo { Code = "DASHBOARD_REPORTS", Name = "Xem các báo cáo phân tích" }
                }
            },
            new ModuleInfo
            {
                Code = "EMPLOYEES",
                Name = "Quản lý Nhân sự",
                Features = new List<FeatureInfo>
                {
                    new FeatureInfo { Code = "EMPLOYEE_VIEW", Name = "Xem danh sách nhân viên" },
                    new FeatureInfo { Code = "EMPLOYEE_CREATE", Name = "Thêm mới nhân viên" },
                    new FeatureInfo { Code = "EMPLOYEE_UPDATE", Name = "Cập nhật thông tin nhân viên" },
                    new FeatureInfo { Code = "EMPLOYEE_DELETE", Name = "Xóa nhân viên" },
                    new FeatureInfo { Code = "EMPLOYEE_EXPORT", Name = "Xuất dữ liệu Excel" }
                }
            },
            new ModuleInfo
            {
                Code = "ATTENDANCE",
                Name = "Quản lý Chấm công",
                Features = new List<FeatureInfo>
                {
                    new FeatureInfo { Code = "ATTENDANCE_VIEW", Name = "Xem bảng công" },
                    new FeatureInfo { Code = "ATTENDANCE_EDIT", Name = "Chỉnh sửa công tay" },
                    new FeatureInfo { Code = "ATTENDANCE_APPROVE", Name = "Duyệt công" },
                    new FeatureInfo { Code = "ATTENDANCE_LOGS", Name = "Xem nhật ký quét vân tay" }
                }
            },
            new ModuleInfo
            {
                Code = "PAYROLL",
                Name = "Quản lý Tiền lương",
                Features = new List<FeatureInfo>
                {
                    new FeatureInfo { Code = "PAYROLL_VIEW", Name = "Xem bảng lương" },
                    new FeatureInfo { Code = "PAYROLL_CALCULATE", Name = "Tính toán bảng lương" },
                    new FeatureInfo { Code = "PAYROLL_APPROVE", Name = "Duyệt bảng lương" },
                    new FeatureInfo { Code = "PAYROLL_LOCK", Name = "Chốt/Khóa bảng lương" }
                }
            },
            new ModuleInfo
            {
                Code = "ORGANIZATION",
                Name = "Cơ cấu tổ chức",
                Features = new List<FeatureInfo>
                {
                    new FeatureInfo { Code = "ORG_VIEW", Name = "Xem sơ đồ tổ chức" },
                    new FeatureInfo { Code = "ORG_MANAGE", Name = "Quản lý Vùng/Chi nhánh/Phòng ban" }
                }
            }
        };
    }
}
