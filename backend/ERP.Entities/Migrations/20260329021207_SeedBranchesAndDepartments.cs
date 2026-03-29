using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class SeedBranchesAndDepartments : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Branches",
                columns: new[] { "id", "address", "code", "name" },
                values: new object[] { 1, "Hà Nội", "HO", "Trụ sở chính" });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "id", "code", "name", "parent_id" },
                values: new object[] { 1, "HR", "Phòng Hành chính Nhân sự", null });

            migrationBuilder.InsertData(
                table: "JobTitles",
                columns: new[] { "id", "code", "name" },
                values: new object[] { 1, "STAFF", "Nhân viên" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Branches",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 1);
        }
    }
}
