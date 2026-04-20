using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class SeedSalaryMasterData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "VariableSalaries",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "VariableSalaries",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "SalaryGrades",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "SalaryGrades",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "IncomeTypes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "IncomeTypes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "AllowanceTypes",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "AllowanceTypes",
                type: "datetime2",
                nullable: true);

            migrationBuilder.InsertData(
                table: "AllowanceTypes",
                columns: new[] { "id", "created_at", "updated_at", "is_active", "name", "tenant_id" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), true, "Phụ cấp ăn trưa", null },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), true, "Phụ cấp xăng xe", null },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), true, "Phụ cấp điện thoại", null }
                });

            migrationBuilder.InsertData(
                table: "IncomeTypes",
                columns: new[] { "id", "created_at", "updated_at", "is_active", "name", "tenant_id" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), true, "Thưởng KPI", null },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), true, "Thưởng lễ tết", null },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), true, "Thu nhập khác", null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "AllowanceTypes",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "AllowanceTypes",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "AllowanceTypes",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "IncomeTypes",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "IncomeTypes",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "IncomeTypes",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "VariableSalaries");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "VariableSalaries");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "SalaryGrades");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "SalaryGrades");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "IncomeTypes");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "IncomeTypes");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "AllowanceTypes");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "AllowanceTypes");
        }
    }
}
