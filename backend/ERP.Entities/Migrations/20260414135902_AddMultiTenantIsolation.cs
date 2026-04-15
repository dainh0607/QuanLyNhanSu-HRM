using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddMultiTenantIsolation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Regions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Departments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Branches",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Tenants",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    subscription_expiry = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Tenants", x => x.id);
                });

            migrationBuilder.UpdateData(
                table: "Branches",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Departments",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: 1);

            migrationBuilder.InsertData(
                table: "Tenants",
                columns: new[] { "name", "code", "is_active", "created_at" },
                values: new object[] { "NexaHR Default Tenant", "DEFAULT", true, DateTime.UtcNow });

            // Patch existing data to default tenant
            migrationBuilder.Sql("UPDATE Users SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE UserRoles SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE Regions SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE Branches SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE Departments SET tenant_id = 1 WHERE tenant_id IS NULL");
            migrationBuilder.Sql("UPDATE Employees SET tenant_id = 1 WHERE tenant_id IS NULL");


            migrationBuilder.UpdateData(
                table: "Regions",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Regions",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: 1);

            migrationBuilder.UpdateData(
                table: "Regions",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: 1);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Tenants");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Regions");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Departments");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Branches");
        }
    }
}
