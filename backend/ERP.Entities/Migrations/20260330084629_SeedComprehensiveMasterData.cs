using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class SeedComprehensiveMasterData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ContractTypes",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { 1, "Thử việc" },
                    { 2, "Hợp đồng 1 năm" },
                    { 3, "Hợp đồng 3 năm" },
                    { 4, "Hợp đồng không thời hạn" }
                });

            migrationBuilder.InsertData(
                table: "DecisionTypes",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { 1, "Quyết định Tuyển dụng" },
                    { 2, "Quyết định Bổ nhiệm" },
                    { 3, "Quyết định Tăng lương" },
                    { 4, "Quyết định Khen thưởng" },
                    { 5, "Quyết định Kỷ luật" },
                    { 6, "Quyết định Nghỉ việc" }
                });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "id", "code", "name", "parent_id" },
                values: new object[,]
                {
                    { 2, "IT", "Phòng Công nghệ", null },
                    { 3, "SALES", "Phòng Kinh doanh", null },
                    { 4, "ACC", "Phòng Kế toán", null }
                });

            migrationBuilder.InsertData(
                table: "DisciplineTypes",
                columns: new[] { "id", "created_at", "updated_at", "code", "description", "display_order", "is_active", "name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL01", "Khiển trách bằng văn bản", null, true, "Khiển trách" },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL02", "Cảnh cáo trước toàn công ty", null, true, "Cảnh cáo" },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL03", "Giảm bậc lương hiện tại", null, true, "Hạ bậc lương" },
                    { 4, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL04", "Miễn nhiệm chức vụ hiện tại", null, true, "Cách chức" },
                    { 5, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL05", "Chấm dứt hợp đồng lao động", null, true, "Sa thải" }
                });

            migrationBuilder.InsertData(
                table: "JobTitles",
                columns: new[] { "id", "code", "name" },
                values: new object[,]
                {
                    { 2, "TEAMLEAD", "Trưởng nhóm" },
                    { 3, "HEAD", "Trưởng phòng" },
                    { 4, "DIRECTOR", "Giám đốc" }
                });

            migrationBuilder.InsertData(
                table: "LeaveDurationTypes",
                columns: new[] { "id", "code", "hours", "name" },
                values: new object[,]
                {
                    { 1, "FULL", 8m, "Cả ngày" },
                    { 2, "MORNING", 4m, "Sáng" },
                    { 3, "AFTERNOON", 4m, "Chiều" }
                });

            migrationBuilder.InsertData(
                table: "LeaveTypes",
                columns: new[] { "id", "is_paid", "name" },
                values: new object[] { 5, true, "Nghỉ hiếu hỉ" });

            migrationBuilder.InsertData(
                table: "Regions",
                columns: new[] { "id", "code", "name" },
                values: new object[,]
                {
                    { 1, "NORTH", "Miền Bắc" },
                    { 2, "CENTRAL", "Miền Trung" },
                    { 3, "SOUTH", "Miền Nam" }
                });

            migrationBuilder.InsertData(
                table: "RequestTypes",
                columns: new[] { "id", "created_at", "updated_at", "category", "code", "is_active", "name", "workflow_id" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "LEAVE", "REQ_LEAVE", true, "Yêu cầu Nghỉ phép", null },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "ATTENDANCE", "REQ_OT", true, "Yêu cầu Làm thêm", null },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "ATTENDANCE", "REQ_SHIFT", true, "Yêu cầu Đổi ca", null },
                    { 4, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "WORK", "REQ_TRIP", true, "Yêu cầu Công tác", null },
                    { 5, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "PAYROLL", "REQ_ADVANCE", true, "Yêu cầu Tạm ứng lương", null }
                });

            migrationBuilder.InsertData(
                table: "RewardTypes",
                columns: new[] { "id", "created_at", "updated_at", "code", "description", "display_order", "is_active", "name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KT01", "Thưởng bằng tiền mặt", null, true, "Tiền mặt" },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KT02", "Thanh thưởng bằng giấy khen", null, true, "Bằng khen" },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KT03", "Thưởng bằng quà tặng/hiện vật", null, true, "Hiện vật" }
                });

            migrationBuilder.InsertData(
                table: "ShiftTypes",
                columns: new[] { "id", "description", "name" },
                values: new object[,]
                {
                    { 1, "Làm việc giờ hành chính (08:00 - 17:00)", "Ca hành chính" },
                    { 2, "Ca làm việc buổi sáng", "Ca sáng (06:00 - 14:00)" },
                    { 3, "Ca làm việc buổi chiều", "Ca chiều (14:00 - 22:00)" },
                    { 4, "Ca làm việc ban đêm", "Ca đêm (22:00 - 06:00)" }
                });

            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "id", "description", "skill_name" },
                values: new object[,]
                {
                    { 1, "Ngôn ngữ quốc tế", "Tiếng Anh" },
                    { 2, "Kỹ năng văn phòng", "Microsoft Office" },
                    { 3, "Kỹ năng dữ liệu", "SQL / Database" },
                    { 4, "Project Management", "Quản lý dự án" }
                });

            migrationBuilder.InsertData(
                table: "TaxBrackets",
                columns: new[] { "id", "effective_date", "expiry_date", "from_income", "tax_rate", "to_income" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 0m, 5m, 5000000m },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 5000001m, 10m, 10000000m },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 10000001m, 15m, 18000000m },
                    { 4, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 18000001m, 20m, 32000000m },
                    { 5, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 32000001m, 25m, 52000000m },
                    { 6, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 52000001m, 30m, 80000000m },
                    { 7, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 80000001m, 35m, null }
                });

            migrationBuilder.InsertData(
                table: "TaxTypes",
                columns: new[] { "id", "code", "is_active", "name" },
                values: new object[] { 1, "PIT", true, "Thuế thu nhập cá nhân" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "LeaveDurationTypes",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "LeaveDurationTypes",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "LeaveDurationTypes",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Regions",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Regions",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Regions",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ShiftTypes",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "ShiftTypes",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "ShiftTypes",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "ShiftTypes",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Skills",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "TaxBrackets",
                keyColumn: "id",
                keyValue: 7);

            migrationBuilder.DeleteData(
                table: "TaxTypes",
                keyColumn: "id",
                keyValue: 1);
        }
    }
}
