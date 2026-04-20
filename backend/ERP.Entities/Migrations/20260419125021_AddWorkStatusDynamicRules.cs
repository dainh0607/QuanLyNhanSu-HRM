using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddWorkStatusDynamicRules : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "allowed_early_minutes",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "allowed_late_minutes",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "early_rules",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_separate_late_early_enabled",
                table: "Employees",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_total_late_early_enabled",
                table: "Employees",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "late_rules",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "resignation_date",
                table: "Employees",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "total_late_early_rules",
                table: "Employees",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ResignationReasons",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    reason_name = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    is_default = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResignationReasons", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ResignationReasons");

            migrationBuilder.DropColumn(
                name: "allowed_early_minutes",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "allowed_late_minutes",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "early_rules",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "is_separate_late_early_enabled",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "is_total_late_early_enabled",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "late_rules",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "resignation_date",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "total_late_early_rules",
                table: "Employees");
        }
    }
}
