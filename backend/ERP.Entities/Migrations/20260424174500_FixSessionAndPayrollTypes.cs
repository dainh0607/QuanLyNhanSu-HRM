using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class FixSessionAndPayrollTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "code",
                table: "PayrollPeriods",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<bool>(
                name: "is_hidden",
                table: "PayrollPeriods",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "payroll_type_id",
                table: "PayrollPeriods",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "time_type",
                table: "PayrollPeriods",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "PayrollTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    payment_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    applicable_branches = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    applicable_departments = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    applicable_job_titles = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    applicable_employees = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    viewer_permissions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollTypes", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "ActionPermissions",
                columns: new[] { "id", "action", "allowed_scope", "condition", "created_at", "description", "is_active", "resource", "role_id", "tenant_id", "updated_at" },
                values: new object[,]
                {
                    { 105, "read", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "payroll", 2, null, null },
                    { 106, "create", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "payroll", 2, null, null },
                    { 107, "update", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "payroll", 2, null, null },
                    { 108, "delete", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "payroll", 2, null, null },
                    { 109, "approve", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "payroll", 2, null, null },
                    { 110, "manage", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "payroll", 2, null, null },
                    { 111, "calculate", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "payroll", 2, null, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_PayrollPeriods_payroll_type_id",
                table: "PayrollPeriods",
                column: "payroll_type_id");

            migrationBuilder.AddForeignKey(
                name: "FK_PayrollPeriods_PayrollTypes_payroll_type_id",
                table: "PayrollPeriods",
                column: "payroll_type_id",
                principalTable: "PayrollTypes",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PayrollPeriods_PayrollTypes_payroll_type_id",
                table: "PayrollPeriods");

            migrationBuilder.DropTable(
                name: "PayrollTypes");

            migrationBuilder.DropIndex(
                name: "IX_PayrollPeriods_payroll_type_id",
                table: "PayrollPeriods");

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 105);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 106);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 107);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 108);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 109);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 110);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 111);

            migrationBuilder.DropColumn(
                name: "code",
                table: "PayrollPeriods");

            migrationBuilder.DropColumn(
                name: "is_hidden",
                table: "PayrollPeriods");

            migrationBuilder.DropColumn(
                name: "payroll_type_id",
                table: "PayrollPeriods");

            migrationBuilder.DropColumn(
                name: "time_type",
                table: "PayrollPeriods");
        }
    }
}
