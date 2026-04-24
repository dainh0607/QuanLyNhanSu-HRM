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
                new Roles { Id = 1, name = "SuperAdmin", description = "Platform Level Administrator", is_active = true, is_system_role = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new Roles { Id = 2, name = "Manager", description = "Executive Board / Manager", is_active = true, is_system_role = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new Roles { Id = 3, name = "Regional Manager", description = "Regional Manager", is_active = true, is_system_role = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new Roles { Id = 4, name = "Branch Manager", description = "Branch Manager", is_active = true, is_system_role = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new Roles { Id = 5, name = "Department Head", description = "Department/Unit Head", is_active = true, is_system_role = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new Roles { Id = 6, name = "Module Admin", description = "Module Specialist Admin", is_active = true, is_system_role = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new Roles { Id = 7, name = "Staff", description = "Regular Employee Staff", is_active = true, is_system_role = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new Roles { Id = 8, name = "Admin", description = "Workspace Administrator", is_active = true, is_system_role = true, CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 2. Genders
            modelBuilder.Entity<Genders>().HasData(
                new Genders { Id = 1, code = "MALE", name = "Nam" },
                new Genders { Id = 2, code = "FEMALE", name = "N\u1EEF" },
                new Genders { Id = 3, code = "OTHER", name = "Kh\u00E1c" }
            );

            // 3. MaritalStatuses
            modelBuilder.Entity<MaritalStatuses>().HasData(
                new MaritalStatuses { Id = 1, code = "SINGLE", name = "\u0110\u1ED9c th\u00E2n" },
                new MaritalStatuses { Id = 2, code = "MARRIED", name = "\u0110\u00E3 k\u1EBFt h\u00F4n" },
                new MaritalStatuses { Id = 3, code = "DIVORCED", name = "Ly h\u00F4n" },
                new MaritalStatuses { Id = 4, code = "WIDOWED", name = "G\u00F3a" }
            );

            // 4. AddressTypes
            modelBuilder.Entity<AddressTypes>().HasData(
                new AddressTypes { Id = 1, name = "Th\u01B0\u1EDDng tr\u00FA" },
                new AddressTypes { Id = 2, name = "T\u1EA1m tr\u00FA" },
                new AddressTypes { Id = 3, name = "S\u00E1t nh\u1EADp" }
            );

            // 5. LeaveTypes
            modelBuilder.Entity<LeaveTypes>().HasData(
                new LeaveTypes { Id = 1, name = "Ngh\u1ECB ph\u00E9p n\u0103m", is_paid = true },
                new LeaveTypes { Id = 2, name = "Ngh\u1ECB \u1ED1m", is_paid = true },
                new LeaveTypes { Id = 3, name = "Ngh\u1ECB kh\u00F4ng l\u01B0\u01A1ng", is_paid = false },
                new LeaveTypes { Id = 4, name = "Ngh\u1ECB thai s\u1EA3n", is_paid = true },
                new LeaveTypes { Id = 5, name = "Ngh\u1ECB hi\u1EBFu h\u1EF7", is_paid = true }
            );

            // 6. LeaveDurationTypes
            modelBuilder.Entity<LeaveDurationTypes>().HasData(
                new LeaveDurationTypes { Id = 1, name = "C\u1EA3 ng\u00E0y", code = "FULL", hours = 8 },
                new LeaveDurationTypes { Id = 2, name = "S\u00E1ng", code = "MORNING", hours = 4 },
                new LeaveDurationTypes { Id = 3, name = "Chi\u1EC1u", code = "AFTERNOON", hours = 4 }
            );

            // 7. Regions (Vùng miền)
            modelBuilder.Entity<Regions>().HasData(
                new Regions { Id = 1, name = "Mi\u1EC1n B\u1EAFc", code = "NORTH" },
                new Regions { Id = 2, name = "Mi\u1EC1n Trung", code = "CENTRAL" },
                new Regions { Id = 3, name = "Mi\u1EC1n Nam", code = "SOUTH" }
            );

            // 8. Branches (Chi nhánh)
            modelBuilder.Entity<Branches>().HasData(
                new Branches { Id = 1, name = "Trụ sở chính", code = "HO", address = "Hà Nội", region_id = 1 }
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
                new ShiftTypes { Id = 1, name = "Ca h\u00E0nh ch\u00EDnh", description = "L\u00E0m vi\u1EC7c gi\u1EDD h\u00E0nh ch\u00EDnh (08:00 - 17:00)" },
                new ShiftTypes { Id = 2, name = "Ca s\u00E1ng (06:00 - 14:00)", description = "Ca l\u00E0m vi\u1EC7c bu\u1ED5i s\u00E1ng" },
                new ShiftTypes { Id = 3, name = "Ca chi\u1EC1u (14:00 - 22:00)", description = "Ca l\u00E0m vi\u1EC7c bu\u1ED5i chi\u1EC1u" },
                new ShiftTypes { Id = 4, name = "Ca \u0111\u00EAm (22:00 - 06:00)", description = "Ca l\u00E0m vi\u1EC7c ban \u0111\u00EAm" }
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
                new DisciplineTypes { Id = 1, keyword = "KYLUAT_KHIEN_TRACH", name = "Khiển trách", description = "Khiển trách bằng văn bản", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new DisciplineTypes { Id = 2, keyword = "KYLUAT_CANH_CAO", name = "Cảnh cáo", description = "Cảnh cáo trước toàn công ty", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new DisciplineTypes { Id = 3, keyword = "KYLUAT_HA_BAC_LUONG", name = "Hạ bậc lương", description = "Giảm bậc lương hiện tại", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new DisciplineTypes { Id = 4, keyword = "KYLUAT_CACH_CHUC", name = "Cách chức", description = "Miễn nhiệm chức vụ hiện tại", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new DisciplineTypes { Id = 5, keyword = "KYLUAT_SA_THAI", name = "Sa thải", description = "Chấm dứt hợp đồng lao động", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 15. RewardTypes (Loại khen thưởng)
            modelBuilder.Entity<RewardTypes>().HasData(
                new RewardTypes { Id = 1, keyword = "THUONG_TIEN_MAT", name = "Tiền mặt", description = "Thưởng bằng tiền mặt", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new RewardTypes { Id = 2, keyword = "THUONG_BANG_KHEN", name = "Bằng khen", description = "Thanh thưởng bằng giấy khen", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new RewardTypes { Id = 3, keyword = "THUONG_HIEN_VAT", name = "Hiện vật", description = "Thưởng bằng quà tặng/hiện vật", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate }
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

            // FIX #1, #2, #3, #4: RBAC Authorization Seed Data
            
            // 19. Role Scopes (Define scope levels for each role)
            modelBuilder.Entity<RoleScopes>().HasData(
                // Role 1: Quản trị (System Admin)
                new RoleScopes { Id = 1, role_id = 1, scope_level = "TENANT", is_hierarchical = false, is_active = true, created_at = seedDate },
                // Role 2: Ban giám đốc (Executive)
                new RoleScopes { Id = 2, role_id = 2, scope_level = "TENANT", is_hierarchical = true, is_active = true, created_at = seedDate },
                // Role 3: Quản lý vùng (Regional Manager)
                new RoleScopes { Id = 3, role_id = 3, scope_level = "REGION", is_hierarchical = true, is_active = true, created_at = seedDate },
                // Role 4: Quản lý chi nhánh (Branch Manager)
                new RoleScopes { Id = 4, role_id = 4, scope_level = "BRANCH", is_hierarchical = true, is_active = true, created_at = seedDate },
                // Role 5: Quản lý bộ phận (Department Manager)
                new RoleScopes { Id = 5, role_id = 5, scope_level = "DEPARTMENT", is_hierarchical = true, is_active = true, created_at = seedDate },
                // Role 6: Quản trị phân hệ (Module Admin) - Cross-region for specific modules
                new RoleScopes { Id = 6, role_id = 6, scope_level = "CROSS_REGION", is_hierarchical = false, 
                    cross_region_modules = "Payroll,Attendance", is_active = true, created_at = seedDate },
                // Role 7: Nhân viên (Standard User)
                new RoleScopes { Id = 7, role_id = 7, scope_level = "PERSONAL", is_hierarchical = false, is_active = true, created_at = seedDate }
            );

            // 20. Resource Permissions (Map resources to roles)
            modelBuilder.Entity<ResourcePermissions>().HasData(
                // Quản trị (System Admin) - Full access
                new ResourcePermissions { Id = 1, role_id = 1, resource_name = "Employees", scope_level = "TENANT", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 2, role_id = 1, resource_name = "Payroll", scope_level = "TENANT", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 3, role_id = 1, resource_name = "Attendance", scope_level = "TENANT", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 4, role_id = 1, resource_name = "Contracts", scope_level = "TENANT", is_active = true, created_at = seedDate },
                // Ban giám đốc (Executive) - Full access
                new ResourcePermissions { Id = 5, role_id = 2, resource_name = "Employees", scope_level = "TENANT", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 6, role_id = 2, resource_name = "Payroll", scope_level = "TENANT", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 7, role_id = 2, resource_name = "Attendance", scope_level = "TENANT", is_active = true, created_at = seedDate },
                // Quản lý vùng (Regional Manager) - Region access
                new ResourcePermissions { Id = 8, role_id = 3, resource_name = "Employees", scope_level = "REGION", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 9, role_id = 3, resource_name = "Payroll", scope_level = "REGION", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 10, role_id = 3, resource_name = "Attendance", scope_level = "REGION", is_active = true, created_at = seedDate },
                // Quản lý chi nhánh (Branch Manager) - Branch access
                new ResourcePermissions { Id = 11, role_id = 4, resource_name = "Employees", scope_level = "BRANCH", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 12, role_id = 4, resource_name = "Payroll", scope_level = "BRANCH", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 13, role_id = 4, resource_name = "Attendance", scope_level = "BRANCH", is_active = true, created_at = seedDate },
                // Quản lý bộ phận (Department Manager) - Department access
                new ResourcePermissions { Id = 14, role_id = 5, resource_name = "Employees", scope_level = "DEPARTMENT", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 15, role_id = 5, resource_name = "Attendance", scope_level = "DEPARTMENT", is_active = true, created_at = seedDate },
                // Quản trị phân hệ (Module Admin) - Cross-region for specific modules
                new ResourcePermissions { Id = 16, role_id = 6, resource_name = "Payroll", scope_level = "CROSS_REGION", is_active = true, created_at = seedDate },
                new ResourcePermissions { Id = 17, role_id = 6, resource_name = "Attendance", scope_level = "CROSS_REGION", is_active = true, created_at = seedDate },
                // Nhân viên (Standard User) - Personal access
                new ResourcePermissions { Id = 18, role_id = 7, resource_name = "MyProfile", scope_level = "PERSONAL", is_active = true, created_at = seedDate }
            );

            // 21. Action Permissions (Map CRUD actions to roles and scopes)
            modelBuilder.Entity<ActionPermissions>().HasData(
                // System Admin - Full CRUD on all resources
                new ActionPermissions { Id = 1, role_id = 1, action = "create", resource = "employee", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 2, role_id = 1, action = "read", resource = "employee", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 3, role_id = 1, action = "update", resource = "employee", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 4, role_id = 1, action = "delete", resource = "employee", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 27, role_id = 1, action = "export", resource = "employee", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                
                // System Admin - Full Management Access
                new ActionPermissions { Id = 24, role_id = 1, action = "manage", resource = "system", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 25, role_id = 1, action = "read", resource = "rbac", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 26, role_id = 1, action = "update", resource = "rbac", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                
                // Executive - Full access within tenant
                new ActionPermissions { Id = 5, role_id = 2, action = "read", resource = "employee", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 6, role_id = 2, action = "approve", resource = "request", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                
                // Regional Manager - Region-scoped CRUD
                new ActionPermissions { Id = 7, role_id = 3, action = "create", resource = "employee", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 8, role_id = 3, action = "read", resource = "employee", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 9, role_id = 3, action = "update", resource = "employee", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 10, role_id = 3, action = "TRANSFER_EMPLOYEE", resource = "employee", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 11, role_id = 3, action = "approve", resource = "request", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                
                // Branch Manager - Branch-scoped operations
                new ActionPermissions { Id = 12, role_id = 4, action = "create", resource = "employee", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 13, role_id = 4, action = "read", resource = "employee", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 14, role_id = 4, action = "update", resource = "employee", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 15, role_id = 4, action = "approve", resource = "request", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },
                
                // Department Manager - Department-scoped operations
                new ActionPermissions { Id = 16, role_id = 5, action = "read", resource = "employee", allowed_scope = "SAME_DEPARTMENT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 17, role_id = 5, action = "ASSIGN_TASK", resource = "employee", allowed_scope = "SAME_DEPARTMENT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 18, role_id = 5, action = "approve", resource = "leave", allowed_scope = "SAME_DEPARTMENT", is_active = true, created_at = seedDate },
                
                // Module Admin - Cross-region for specific resources
                new ActionPermissions { Id = 19, role_id = 6, action = "read", resource = "payroll", allowed_scope = "CROSS_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 20, role_id = 6, action = "read", resource = "attendance", allowed_scope = "CROSS_REGION", is_active = true, created_at = seedDate },
                
                // Standard User - Personal operations
                new ActionPermissions { Id = 21, role_id = 7, action = "read", resource = "myprofile", allowed_scope = "PERSONAL", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 22, role_id = 7, action = "update", resource = "myprofile", allowed_scope = "PERSONAL", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 23, role_id = 7, action = "create", resource = "request", allowed_scope = "PERSONAL", is_active = true, created_at = seedDate },

                // --- Additional Permissions for Batch Fix ---
                // Admin (Role 1)
                new ActionPermissions { Id = 28, role_id = 1, action = "read", resource = "attendance", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 29, role_id = 1, action = "update", resource = "attendance", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 30, role_id = 1, action = "approve", resource = "attendance", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 31, role_id = 1, action = "read", resource = "organization", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 32, role_id = 1, action = "create", resource = "organization", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 33, role_id = 1, action = "update", resource = "organization", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 34, role_id = 1, action = "delete", resource = "organization", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 35, role_id = 1, action = "read", resource = "leave", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 36, role_id = 1, action = "create", resource = "leave", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 37, role_id = 1, action = "approve", resource = "leave", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },

                // Executive (Role 2)
                new ActionPermissions { Id = 38, role_id = 2, action = "read", resource = "attendance", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 39, role_id = 2, action = "approve", resource = "attendance", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 40, role_id = 2, action = "read", resource = "leave", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 41, role_id = 2, action = "approve", resource = "leave", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },

                // Regional Manager (Role 3)
                new ActionPermissions { Id = 42, role_id = 3, action = "read", resource = "attendance", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 43, role_id = 3, action = "update", resource = "attendance", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 44, role_id = 3, action = "approve", resource = "attendance", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 45, role_id = 3, action = "read", resource = "organization", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 46, role_id = 3, action = "read", resource = "leave", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 47, role_id = 3, action = "approve", resource = "leave", allowed_scope = "SAME_REGION", is_active = true, created_at = seedDate },

                // Branch Manager (Role 4)
                new ActionPermissions { Id = 48, role_id = 4, action = "read", resource = "attendance", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 49, role_id = 4, action = "update", resource = "attendance", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 50, role_id = 4, action = "approve", resource = "attendance", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 51, role_id = 4, action = "read", resource = "organization", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 52, role_id = 4, action = "read", resource = "leave", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 53, role_id = 4, action = "approve", resource = "leave", allowed_scope = "SAME_BRANCH", is_active = true, created_at = seedDate },

                // Department Manager (Role 5)
                new ActionPermissions { Id = 54, role_id = 5, action = "read", resource = "attendance", allowed_scope = "SAME_DEPARTMENT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 55, role_id = 5, action = "update", resource = "attendance", allowed_scope = "SAME_DEPARTMENT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 56, role_id = 5, action = "approve", resource = "attendance", allowed_scope = "SAME_DEPARTMENT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 57, role_id = 5, action = "read", resource = "leave", allowed_scope = "SAME_DEPARTMENT", is_active = true, created_at = seedDate },

                // Admin (Role 1) - Management resources
                new ActionPermissions { Id = 58, role_id = 1, action = "read", resource = "system", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 59, role_id = 1, action = "update", resource = "system", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 60, role_id = 1, action = "delete", resource = "system", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 61, role_id = 1, action = "read", resource = "user", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 62, role_id = 1, action = "update", resource = "user", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 63, role_id = 1, action = "read", resource = "contracts", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate },
                new ActionPermissions { Id = 64, role_id = 1, action = "update", resource = "contracts", allowed_scope = "SAME_TENANT", is_active = true, created_at = seedDate }
            );

            // 22. Request Type Approvers (Approval chains for each request type)
            modelBuilder.Entity<RequestTypeApprovers>().HasData(
                // Leave Request approval chain
                new RequestTypeApprovers { Id = 1, request_type_id = 1, role_id = 5, approval_level = 1, 
                    max_approval_days = 2, is_mandatory = true, approver_scope = "SAME_DEPARTMENT", 
                    is_active = true, created_at = seedDate },
                new RequestTypeApprovers { Id = 2, request_type_id = 1, role_id = 4, approval_level = 2, 
                    max_approval_days = 30, is_mandatory = false, approver_scope = "SAME_BRANCH", 
                    is_active = true, created_at = seedDate },
                new RequestTypeApprovers { Id = 3, request_type_id = 1, role_id = 2, approval_level = 3, 
                    max_approval_days = null, is_mandatory = false, approver_scope = "SAME_TENANT", 
                    is_active = true, created_at = seedDate },
                
                // Overtime Request
                new RequestTypeApprovers { Id = 4, request_type_id = 2, role_id = 5, approval_level = 1, 
                    max_approval_days = 1, is_mandatory = true, approver_scope = "SAME_DEPARTMENT", 
                    is_active = true, created_at = seedDate },
                new RequestTypeApprovers { Id = 5, request_type_id = 2, role_id = 4, approval_level = 2, 
                    max_approval_days = null, is_mandatory = false, approver_scope = "SAME_BRANCH", 
                    is_active = true, created_at = seedDate }
            );

            // 23. Countries
            modelBuilder.Entity<Countries>().HasData(
                new Countries { Id = 1, code = "VN", name = "Việt Nam", CreatedAt = seedDate, UpdatedAt = seedDate },
                new Countries { Id = 2, code = "US", name = "United States", CreatedAt = seedDate, UpdatedAt = seedDate },
                new Countries { Id = 3, code = "JP", name = "Japan", CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 24. Provinces (Mock major cities for VN)
            modelBuilder.Entity<Provinces>().HasData(
                new Provinces { Id = 1, code = "HN", name = "Hà Nội", country_code = "VN", CreatedAt = seedDate, UpdatedAt = seedDate },
                new Provinces { Id = 2, code = "HCM", name = "TP. Hồ Chí Minh", country_code = "VN", CreatedAt = seedDate, UpdatedAt = seedDate },
                new Provinces { Id = 3, code = "DN", name = "Đà Nẵng", country_code = "VN", CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 25. Districts (Mock districts for major cities)
            modelBuilder.Entity<Districts>().HasData(
                new Districts { Id = 1, code = "HN_BD", name = "Ba Đình", province_code = "HN", CreatedAt = seedDate, UpdatedAt = seedDate },
                new Districts { Id = 2, code = "HN_CG", name = "Cầu Giấy", province_code = "HN", CreatedAt = seedDate, UpdatedAt = seedDate },
                new Districts { Id = 3, code = "HCM_Q1", name = "Quận 1", province_code = "HCM", CreatedAt = seedDate, UpdatedAt = seedDate },
                new Districts { Id = 4, code = "HCM_Q3", name = "Quận 3", province_code = "HCM", CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 26. Allowance Types
            modelBuilder.Entity<AllowanceType>().HasData(
                new AllowanceType { Id = 1, name = "Phụ cấp ăn trưa", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new AllowanceType { Id = 2, name = "Phụ cấp xăng xe", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new AllowanceType { Id = 3, name = "Phụ cấp điện thoại", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate }
            );

            // 27. Income Types
            modelBuilder.Entity<IncomeType>().HasData(
                new IncomeType { Id = 1, name = "Thưởng KPI", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new IncomeType { Id = 2, name = "Thưởng lễ tết", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate },
                new IncomeType { Id = 3, name = "Thu nhập khác", is_active = true, CreatedAt = seedDate, UpdatedAt = seedDate }
            );
        }
    }
}
