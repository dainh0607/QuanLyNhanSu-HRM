using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddEmploymentTypes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "employment_type_id",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EmploymentTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    display_order = table.Column<int>(type: "int", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmploymentTypes", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_employment_type_id",
                table: "Employees",
                column: "employment_type_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_EmploymentTypes_employment_type_id",
                table: "Employees",
                column: "employment_type_id",
                principalTable: "EmploymentTypes",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_EmploymentTypes_employment_type_id",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "EmploymentTypes");

            migrationBuilder.DropIndex(
                name: "IX_Employees_employment_type_id",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "employment_type_id",
                table: "Employees");
        }
    }
}
