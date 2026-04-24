using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Provinces");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Districts");

            migrationBuilder.CreateTable(
                name: "EmployeeTimekeepingMachines",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    machine_id = table.Column<int>(type: "int", nullable: false),
                    timekeeping_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeTimekeepingMachines", x => x.id);
                    table.ForeignKey(
                        name: "FK_EmployeeTimekeepingMachines_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeTimekeepingMachines_TimeMachines_machine_id",
                        column: x => x.machine_id,
                        principalTable: "TimeMachines",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Wards",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    district_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Wards", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Wards_Districts_district_code",
                        column: x => x.district_code,
                        principalTable: "Districts",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeTimekeepingMachines_employee_id",
                table: "EmployeeTimekeepingMachines",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeTimekeepingMachines_machine_id",
                table: "EmployeeTimekeepingMachines",
                column: "machine_id");

            migrationBuilder.CreateIndex(
                name: "IX_Wards_district_code",
                table: "Wards",
                column: "district_code");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmployeeTimekeepingMachines");

            migrationBuilder.DropTable(
                name: "Wards");

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Provinces",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Districts",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Districts",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Districts",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Districts",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Districts",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Provinces",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Provinces",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Provinces",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);
        }
    }
}
