using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAuditLogsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MobilePermissionManifest",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    parent_id = table.Column<int>(type: "int", nullable: true),
                    code = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    is_module = table.Column<bool>(type: "bit", nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MobilePermissionManifest", x => x.id);
                    table.ForeignKey(
                        name: "FK_MobilePermissionManifest_MobilePermissionManifest_parent_id",
                        column: x => x.parent_id,
                        principalTable: "MobilePermissionManifest",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeMobilePermissions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    mobile_permission_id = table.Column<int>(type: "int", nullable: false),
                    is_allowed = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeMobilePermissions", x => x.id);
                    table.ForeignKey(
                        name: "FK_EmployeeMobilePermissions_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeMobilePermissions_MobilePermissionManifest_mobile_permission_id",
                        column: x => x.mobile_permission_id,
                        principalTable: "MobilePermissionManifest",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeMobilePermissions_employee_id",
                table: "EmployeeMobilePermissions",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeMobilePermissions_mobile_permission_id",
                table: "EmployeeMobilePermissions",
                column: "mobile_permission_id");

            migrationBuilder.CreateIndex(
                name: "IX_MobilePermissionManifest_parent_id",
                table: "MobilePermissionManifest",
                column: "parent_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "EmployeeMobilePermissions");

            migrationBuilder.DropTable(
                name: "MobilePermissionManifest");
        }
    }
}
