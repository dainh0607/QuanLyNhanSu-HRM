using System;
using Microsoft.EntityFrameworkCore;
using ERP.Entities.Models;

namespace ERP.Entities.Seeding
{
    public static class ModelBuilderExtensions
    {
        public static void SeedMasterData(this ModelBuilder modelBuilder)
        {
            var seedDate = new DateTime(2026, 3, 27, 0, 0, 0, DateTimeKind.Utc);

            // 1. Roles
            modelBuilder.Entity<Roles>().HasData(
                new Roles { Id = 1, name = "Admin", description = "System Administrator", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new Roles { Id = 2, name = "Manager", description = "Department Manager", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new Roles { Id = 3, name = "User", description = "Regular Employee", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 2. Genders
            modelBuilder.Entity<Genders>().HasData(
                new Genders { Id = 1, code = "MALE", name = "Nam" },
                new Genders { Id = 2, code = "FEMALE", name = "Nữ" },
                new Genders { Id = 3, code = "OTHER", name = "Khác" }
            );

            // 3. MaritalStatuses
            modelBuilder.Entity<MaritalStatuses>().HasData(
                new MaritalStatuses { Id = 1, code = "SINGLE", name = "Độc thân" },
                new MaritalStatuses { Id = 2, code = "MARRIED", name = "Đã kết hôn" },
                new MaritalStatuses { Id = 3, code = "DIVORCED", name = "Ly hôn" },
                new MaritalStatuses { Id = 4, code = "WIDOWED", name = "Góa" }
            );

            // 4. AddressTypes
            modelBuilder.Entity<AddressTypes>().HasData(
                new AddressTypes { Id = 1, name = "Thường trú" },
                new AddressTypes { Id = 2, name = "Tạm trú" },
                new AddressTypes { Id = 3, name = "Sát nhập" }
            );

            // 5. LeaveTypes
            modelBuilder.Entity<LeaveTypes>().HasData(
                new LeaveTypes { Id = 1, name = "Nghỉ phép năm", is_paid = true },
                new LeaveTypes { Id = 2, name = "Nghỉ ốm", is_paid = true },
                new LeaveTypes { Id = 3, name = "Nghỉ không lương", is_paid = false },
                new LeaveTypes { Id = 4, name = "Nghỉ thai sản", is_paid = true },
                new LeaveTypes { Id = 5, name = "Nghỉ hiếu hỉ", is_paid = true }
            );

            // 6. LeaveDurationTypes
            modelBuilder.Entity<LeaveDurationTypes>().HasData(
                new LeaveDurationTypes { Id = 1, name = "Cả ngày", code = "FULL", hours = 8 },
                new LeaveDurationTypes { Id = 2, name = "Sáng", code = "MORNING", hours = 4 },
                new LeaveDurationTypes { Id = 3, name = "Chiều", code = "AFTERNOON", hours = 4 }
            );

            // 7. Regions (Vùng miền)
            modelBuilder.Entity<Regions>().HasData(
                new Regions { Id = 1, name = "Miền Bắc", code = "NORTH" },
                new Regions { Id = 2, name = "Miền Trung", code = "CENTRAL" },
                new Regions { Id = 3, name = "Miền Nam", code = "SOUTH" }
            );

            // 8. Branches (Chi nhánh)
            modelBuilder.Entity<Branches>().HasData(
                new Branches { Id = 1, name = "Trụ sở chính", code = "HO", address = "Hà Nội" }
            );

            // 9. Departments (Phòng ban)
            modelBuilder.Entity<Departments>().HasData(
                new Departments { Id = 1, name = "Phòng Hành chính Nhân sự", code = "HR" },
                new Departments { Id = 2, name = "Phòng Công nghệ", code = "IT" },
                new Departments { Id = 3, name = "Phòng Kinh doanh", code = "SALES" },
                new Departments { Id = 4, name = "Phòng Kế toán", code = "ACC" }
            );

            // 10. JobTitles (Chức vụ)
            modelBuilder.Entity<JobTitles>().HasData(
                new JobTitles { Id = 1, name = "Nhân viên", code = "STAFF" },
                new JobTitles { Id = 2, name = "Trưởng nhóm", code = "TEAMLEAD" },
                new JobTitles { Id = 3, name = "Trưởng phòng", code = "HEAD" },
                new JobTitles { Id = 4, name = "Giám đốc", code = "DIRECTOR" }
            );

            // 11. ContractTypes (Loại hợp đồng)
            modelBuilder.Entity<ContractTypes>().HasData(
                new ContractTypes { Id = 1, name = "Hợp đồng thử việc" },
                new ContractTypes { Id = 2, name = "Hợp đồng lao động xác định thời hạn (12 tháng)" },
                new ContractTypes { Id = 3, name = "Hợp đồng lao động xác định thời hạn (36 tháng)" },
                new ContractTypes { Id = 4, name = "Hợp đồng lao động không xác định thời hạn" },
                new ContractTypes { Id = 5, name = "Hợp đồng khoán việc / Cộng tác viên" }
            );

            // 12. ShiftTypes (Ca làm việc)
            modelBuilder.Entity<ShiftTypes>().HasData(
                new ShiftTypes { Id = 1, name = "Ca hành chính", description = "Làm việc giờ hành chính (08:00 - 17:00)" },
                new ShiftTypes { Id = 2, name = "Ca sáng (06:00 - 14:00)", description = "Ca làm việc buổi sáng" },
                new ShiftTypes { Id = 3, name = "Ca chiều (14:00 - 22:00)", description = "Ca làm việc buổi chiều" },
                new ShiftTypes { Id = 4, name = "Ca đêm (22:00 - 06:00)", description = "Ca làm việc ban đêm" }
            );

            // 13. DecisionTypes (Loại quyết định)
            modelBuilder.Entity<DecisionTypes>().HasData(
                new DecisionTypes { Id = 1, name = "Quyết định Tuyển dụng" },
                new DecisionTypes { Id = 2, name = "Quyết định Bổ nhiệm" },
                new DecisionTypes { Id = 3, name = "Quyết định Tăng lương" },
                new DecisionTypes { Id = 4, name = "Quyết định Khen thưởng" },
                new DecisionTypes { Id = 5, name = "Quyết định Kỷ luật" },
                new DecisionTypes { Id = 6, name = "Quyết định Nghỉ việc" }
            );

            // 14. DisciplineTypes (Loại kỷ luật)
            modelBuilder.Entity<DisciplineTypes>().HasData(
                new DisciplineTypes { Id = 1, code = "KL01", name = "Khiển trách", description = "Khiển trách bằng văn bản", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new DisciplineTypes { Id = 2, code = "KL02", name = "Cảnh cáo", description = "Cảnh cáo trước toàn công ty", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new DisciplineTypes { Id = 3, code = "KL03", name = "Hạ bậc lương", description = "Giảm bậc lương hiện tại", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new DisciplineTypes { Id = 4, code = "KL04", name = "Cách chức", description = "Miễn nhiệm chức vụ hiện tại", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new DisciplineTypes { Id = 5, code = "KL05", name = "Sa thải", description = "Chấm dứt hợp đồng lao động", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 15. RewardTypes (Loại khen thưởng)
            modelBuilder.Entity<RewardTypes>().HasData(
                new RewardTypes { Id = 1, code = "KT01", name = "Tiền mặt", description = "Thưởng bằng tiền mặt", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new RewardTypes { Id = 2, code = "KT02", name = "Bằng khen", description = "Thanh thưởng bằng giấy khen", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new RewardTypes { Id = 3, code = "KT03", name = "Hiện vật", description = "Thưởng bằng quà tặng/hiện vật", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 16. RequestTypes (Loại yêu cầu)
            modelBuilder.Entity<RequestTypes>().HasData(
                new RequestTypes { Id = 1, code = "REQ_LEAVE", name = "Yêu cầu Nghỉ phép", category = "LEAVE", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new RequestTypes { Id = 2, code = "REQ_OT", name = "Yêu cầu Làm thêm", category = "ATTENDANCE", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new RequestTypes { Id = 3, code = "REQ_SHIFT", name = "Yêu cầu Đổi ca", category = "ATTENDANCE", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new RequestTypes { Id = 4, code = "REQ_TRIP", name = "Yêu cầu Công tác", category = "WORK", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new RequestTypes { Id = 5, code = "REQ_ADVANCE", name = "Yêu cầu Tạm ứng lương", category = "PAYROLL", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 17. Skills (Kỹ năng)
            modelBuilder.Entity<Skills>().HasData(
                new Skills { Id = 1, skill_name = "Tiếng Anh", description = "Ngôn ngữ quốc tế" },
                new Skills { Id = 2, skill_name = "Microsoft Office", description = "Kỹ năng văn phòng" },
                new Skills { Id = 3, skill_name = "SQL / Database", description = "Kỹ năng dữ liệu" },
                new Skills { Id = 4, skill_name = "Quản lý dự án", description = "Project Management" }
            );

            // 18. Tax + Insurance
            modelBuilder.Entity<TaxTypes>().HasData(
                new TaxTypes { Id = 1, code = "PIT", name = "Thuế thu nhập cá nhân", is_active = true }
            );

            // Vietnamese PIT 2024 progressive levels
            modelBuilder.Entity<TaxBrackets>().HasData(
                new TaxBrackets { Id = 1, from_income = 0m, to_income = 5000000m, tax_rate = 5m, effective_date = seedDate },
                new TaxBrackets { Id = 2, from_income = 5000001m, to_income = 10000000m, tax_rate = 10m, effective_date = seedDate },
                new TaxBrackets { Id = 3, from_income = 10000001m, to_income = 18000000m, tax_rate = 15m, effective_date = seedDate },
                new TaxBrackets { Id = 4, from_income = 18000001m, to_income = 32000000m, tax_rate = 20m, effective_date = seedDate },
                new TaxBrackets { Id = 5, from_income = 32000001m, to_income = 52000000m, tax_rate = 25m, effective_date = seedDate },
                new TaxBrackets { Id = 6, from_income = 52000001m, to_income = 80000000m, tax_rate = 30m, effective_date = seedDate },
                new TaxBrackets { Id = 7, from_income = 80000001m, to_income = null, tax_rate = 35m, effective_date = seedDate }
            );
        }
    }
}
