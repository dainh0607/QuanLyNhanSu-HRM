using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDepartmentHierarchyAndHeadFlag : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "display_order",
                table: "Departments",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "is_head_department",
                table: "Departments",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "display_order", "is_head_department" },
                values: new object[] { 0, false });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "display_order", "is_head_department" },
                values: new object[] { 0, false });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "display_order", "is_head_department" },
                values: new object[] { 0, false });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "display_order", "is_head_department" },
                values: new object[] { 0, false });

            migrationBuilder.CreateIndex(
                name: "IX_Departments_parent_id",
                table: "Departments",
                column: "parent_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Departments_parent_id",
                table: "Departments",
                column: "parent_id",
                principalTable: "Departments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Departments_parent_id",
                table: "Departments");

            migrationBuilder.DropIndex(
                name: "IX_Departments_parent_id",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "display_order",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "is_head_department",
                table: "Departments");
        }
    }
}
