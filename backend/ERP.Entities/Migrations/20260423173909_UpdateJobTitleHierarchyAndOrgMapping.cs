using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateJobTitleHierarchyAndOrgMapping : Migration
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
                name: "department_id",
                table: "JobTitles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "display_order",
                table: "JobTitles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "experience",
                table: "JobTitles",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "parent_id",
                table: "JobTitles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "qualification",
                table: "JobTitles",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "branch_id", "department_id", "display_order", "experience", "parent_id", "qualification" },
                values: new object[] { null, null, 0, null, null, null });

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "branch_id", "department_id", "display_order", "experience", "parent_id", "qualification" },
                values: new object[] { null, null, 0, null, null, null });

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "branch_id", "department_id", "display_order", "experience", "parent_id", "qualification" },
                values: new object[] { null, null, 0, null, null, null });

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "branch_id", "department_id", "display_order", "experience", "parent_id", "qualification" },
                values: new object[] { null, null, 0, null, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_branch_id",
                table: "JobTitles",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_department_id",
                table: "JobTitles",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_JobTitles_parent_id",
                table: "JobTitles",
                column: "parent_id");

            migrationBuilder.AddForeignKey(
                name: "FK_JobTitles_Branches_branch_id",
                table: "JobTitles",
                column: "branch_id",
                principalTable: "Branches",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobTitles_Departments_department_id",
                table: "JobTitles",
                column: "department_id",
                principalTable: "Departments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_JobTitles_JobTitles_parent_id",
                table: "JobTitles",
                column: "parent_id",
                principalTable: "JobTitles",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobTitles_Branches_branch_id",
                table: "JobTitles");

            migrationBuilder.DropForeignKey(
                name: "FK_JobTitles_Departments_department_id",
                table: "JobTitles");

            migrationBuilder.DropForeignKey(
                name: "FK_JobTitles_JobTitles_parent_id",
                table: "JobTitles");

            migrationBuilder.DropIndex(
                name: "IX_JobTitles_branch_id",
                table: "JobTitles");

            migrationBuilder.DropIndex(
                name: "IX_JobTitles_department_id",
                table: "JobTitles");

            migrationBuilder.DropIndex(
                name: "IX_JobTitles_parent_id",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "branch_id",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "department_id",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "display_order",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "experience",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "parent_id",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "qualification",
                table: "JobTitles");
        }
    }
}
