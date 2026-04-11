using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddShiftTemplatesAndLinkedBranches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "branch_id",
                table: "JobTitles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "branch_id",
                table: "Departments",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ShiftTemplates",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    template_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    start_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    is_cross_night = table.Column<bool>(type: "bit", nullable: false),
                    branch_ids = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    department_ids = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    position_ids = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    repeat_days = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftTemplates", x => x.id);
                });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 1,
                column: "branch_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 2,
                column: "branch_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 3,
                column: "branch_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 4,
                column: "branch_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 1,
                column: "branch_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 2,
                column: "branch_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 3,
                column: "branch_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 4,
                column: "branch_id",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_branch_id",
                table: "JobTitles",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_Departments_branch_id",
                table: "Departments",
                column: "branch_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Departments_Branches_branch_id",
                table: "Departments",
                column: "branch_id",
                principalTable: "Branches",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobTitles_Branches_branch_id",
                table: "JobTitles",
                column: "branch_id",
                principalTable: "Branches",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Departments_Branches_branch_id",
                table: "Departments");

            migrationBuilder.DropForeignKey(
                name: "FK_JobTitles_Branches_branch_id",
                table: "JobTitles");

            migrationBuilder.DropTable(
                name: "ShiftTemplates");

            migrationBuilder.DropIndex(
                name: "IX_JobTitles_branch_id",
                table: "JobTitles");

            migrationBuilder.DropIndex(
                name: "IX_Departments_branch_id",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "branch_id",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "branch_id",
                table: "Departments");
        }
    }
}
