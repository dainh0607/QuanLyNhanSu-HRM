using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOrganizationModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobTitles_Branches_branch_id",
                table: "JobTitles");

            migrationBuilder.DropIndex(
                name: "IX_JobTitles_branch_id",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "branch_id",
                table: "JobTitles");

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Regions",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "Regions",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "Regions",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "JobTitles",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "JobTitles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "JobTitles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "code",
                table: "Departments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Departments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "Departments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "Departments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Branches",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "note",
                table: "Branches",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "Branches",
                type: "datetime2",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Branches",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "Regions",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "Regions",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });

            migrationBuilder.UpdateData(
                table: "Regions",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "created_at", "updated_at", "note" },
                values: new object[] { new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified), null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Regions");

            migrationBuilder.DropColumn(
                name: "note",
                table: "Regions");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "Regions");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "note",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "note",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "note",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "Branches");

            migrationBuilder.AddColumn<int>(
                name: "branch_id",
                table: "JobTitles",
                type: "int",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "code",
                table: "Departments",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

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

            migrationBuilder.AddForeignKey(
                name: "FK_JobTitles_Branches_branch_id",
                table: "JobTitles",
                column: "branch_id",
                principalTable: "Branches",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
