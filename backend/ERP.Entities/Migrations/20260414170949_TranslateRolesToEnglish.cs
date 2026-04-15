using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class TranslateRolesToEnglish : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "description", "name" },
                values: new object[] { "System Administrator", "Admin" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "description", "name" },
                values: new object[] { "Executive Board / Manager", "Manager" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "description", "name" },
                values: new object[] { "Regional Manager", "Regional Manager" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "description", "name" },
                values: new object[] { "Branch Manager", "Branch Manager" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 5,
                columns: new[] { "description", "name" },
                values: new object[] { "Department/Unit Head", "Department Head" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 6,
                columns: new[] { "description", "name" },
                values: new object[] { "Module Specialist Admin", "Module Admin" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 7,
                columns: new[] { "description", "name" },
                values: new object[] { "Regular Employee Staff", "Staff" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "description", "name" },
                values: new object[] { "Quản trị hệ thống cao nhất", "Quản trị" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "description", "name" },
                values: new object[] { "Thành viên Ban giám đốc", "Ban giám đốc" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "description", "name" },
                values: new object[] { "Quản lý theo vùng/miền", "Quản lý vùng" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "description", "name" },
                values: new object[] { "Quản lý tại chi nhánh", "Quản lý chi nhánh" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 5,
                columns: new[] { "description", "name" },
                values: new object[] { "Quản lý phòng ban/bộ phận", "Quản lý bộ phận" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 6,
                columns: new[] { "description", "name" },
                values: new object[] { "Quản trị các phân hệ nghiệp vụ", "Quản trị phân hệ" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 7,
                columns: new[] { "description", "name" },
                values: new object[] { "Nhân viên chính thức", "Nhân viên" });
        }
    }
}
