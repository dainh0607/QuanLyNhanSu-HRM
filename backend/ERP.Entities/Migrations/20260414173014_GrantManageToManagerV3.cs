using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class GrantManageToManagerV3 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "ActionPermissions",
                columns: new[] { "id", "action", "allowed_scope", "condition", "created_at", "description", "is_active", "resource", "role_id", "tenant_id", "updated_at" },
                values: new object[,]
                {
                    { 27, "Manage", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "System", 2, null, null },
                    { 28, "READ", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "RBAC", 2, null, null }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 27);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 28);
        }
    }
}
