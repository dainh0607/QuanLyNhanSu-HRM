using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateResignationReasons : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "reason_name",
                table: "ResignationReasons",
                newName: "name");

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "ResignationReasons",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "ResignationReasons",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "resignation_reason_id",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Employees_resignation_reason_id",
                table: "Employees",
                column: "resignation_reason_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_ResignationReasons_resignation_reason_id",
                table: "Employees",
                column: "resignation_reason_id",
                principalTable: "ResignationReasons",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_ResignationReasons_resignation_reason_id",
                table: "Employees");

            migrationBuilder.DropIndex(
                name: "IX_Employees_resignation_reason_id",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "description",
                table: "ResignationReasons");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "ResignationReasons");

            migrationBuilder.DropColumn(
                name: "resignation_reason_id",
                table: "Employees");

            migrationBuilder.RenameColumn(
                name: "name",
                table: "ResignationReasons",
                newName: "reason_name");
        }
    }
}
