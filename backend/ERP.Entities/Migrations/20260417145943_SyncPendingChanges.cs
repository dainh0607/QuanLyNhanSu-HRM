using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class SyncPendingChanges : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "action", "resource" },
                values: new object[] { "create", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "action", "resource" },
                values: new object[] { "read", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "action", "resource" },
                values: new object[] { "update", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "action", "resource" },
                values: new object[] { "delete", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 5,
                columns: new[] { "action", "resource" },
                values: new object[] { "read", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 6,
                columns: new[] { "action", "resource" },
                values: new object[] { "approve", "request" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 7,
                columns: new[] { "action", "resource" },
                values: new object[] { "create", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 8,
                columns: new[] { "action", "resource" },
                values: new object[] { "read", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 9,
                columns: new[] { "action", "resource" },
                values: new object[] { "update", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 10,
                column: "resource",
                value: "employee");

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 11,
                columns: new[] { "action", "resource" },
                values: new object[] { "approve", "request" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 12,
                columns: new[] { "action", "resource" },
                values: new object[] { "create", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 13,
                columns: new[] { "action", "resource" },
                values: new object[] { "read", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 14,
                columns: new[] { "action", "resource" },
                values: new object[] { "update", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 15,
                columns: new[] { "action", "resource" },
                values: new object[] { "approve", "request" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 16,
                columns: new[] { "action", "resource" },
                values: new object[] { "read", "employee" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 17,
                column: "resource",
                value: "employee");

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 18,
                columns: new[] { "action", "resource" },
                values: new object[] { "approve", "leave" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 19,
                columns: new[] { "action", "resource" },
                values: new object[] { "read", "payroll" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 20,
                columns: new[] { "action", "resource" },
                values: new object[] { "read", "attendance" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 21,
                columns: new[] { "action", "resource" },
                values: new object[] { "read", "myprofile" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 22,
                columns: new[] { "action", "resource" },
                values: new object[] { "update", "myprofile" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 23,
                columns: new[] { "action", "resource" },
                values: new object[] { "create", "request" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 24,
                columns: new[] { "action", "resource" },
                values: new object[] { "manage", "system" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 25,
                columns: new[] { "action", "resource" },
                values: new object[] { "read", "rbac" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 26,
                columns: new[] { "action", "resource" },
                values: new object[] { "update", "rbac" });

            migrationBuilder.InsertData(
                table: "ActionPermissions",
                columns: new[] { "id", "action", "allowed_scope", "condition", "created_at", "description", "is_active", "resource", "role_id", "tenant_id", "updated_at" },
                values: new object[,]
                {
                    { 27, "export", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "employee", 1, null, null },
                    { 28, "read", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 1, null, null },
                    { 29, "update", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 1, null, null },
                    { 30, "approve", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 1, null, null },
                    { 31, "read", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "organization", 1, null, null },
                    { 32, "create", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "organization", 1, null, null },
                    { 33, "update", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "organization", 1, null, null },
                    { 34, "delete", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "organization", 1, null, null },
                    { 35, "read", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 1, null, null },
                    { 36, "create", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 1, null, null },
                    { 37, "approve", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 1, null, null },
                    { 38, "read", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 2, null, null },
                    { 39, "approve", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 2, null, null },
                    { 40, "read", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 2, null, null },
                    { 41, "approve", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 2, null, null },
                    { 42, "read", "SAME_REGION", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 3, null, null },
                    { 43, "update", "SAME_REGION", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 3, null, null },
                    { 44, "approve", "SAME_REGION", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 3, null, null },
                    { 45, "read", "SAME_REGION", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "organization", 3, null, null },
                    { 46, "read", "SAME_REGION", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 3, null, null },
                    { 47, "approve", "SAME_REGION", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 3, null, null },
                    { 48, "read", "SAME_BRANCH", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 4, null, null },
                    { 49, "update", "SAME_BRANCH", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 4, null, null },
                    { 50, "approve", "SAME_BRANCH", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 4, null, null },
                    { 51, "read", "SAME_BRANCH", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "organization", 4, null, null },
                    { 52, "read", "SAME_BRANCH", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 4, null, null },
                    { 53, "approve", "SAME_BRANCH", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 4, null, null },
                    { 54, "read", "SAME_DEPARTMENT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 5, null, null },
                    { 55, "update", "SAME_DEPARTMENT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 5, null, null },
                    { 56, "approve", "SAME_DEPARTMENT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "attendance", 5, null, null },
                    { 57, "read", "SAME_DEPARTMENT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "leave", 5, null, null },
                    { 58, "read", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "system", 1, null, null },
                    { 59, "update", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "system", 1, null, null },
                    { 60, "delete", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "system", 1, null, null },
                    { 61, "read", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "user", 1, null, null },
                    { 62, "update", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "user", 1, null, null },
                    { 63, "read", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "contracts", 1, null, null },
                    { 64, "update", "SAME_TENANT", null, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, true, "contracts", 1, null, null }
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

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 29);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 30);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 31);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 32);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 33);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 34);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 35);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 36);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 37);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 38);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 39);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 40);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 41);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 42);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 43);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 44);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 45);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 46);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 47);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 48);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 49);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 50);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 51);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 52);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 53);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 54);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 55);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 56);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 57);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 58);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 59);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 60);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 61);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 62);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 63);

            migrationBuilder.DeleteData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 64);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "action", "resource" },
                values: new object[] { "CREATE", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "action", "resource" },
                values: new object[] { "READ", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "action", "resource" },
                values: new object[] { "UPDATE", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "action", "resource" },
                values: new object[] { "DELETE", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 5,
                columns: new[] { "action", "resource" },
                values: new object[] { "READ", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 6,
                columns: new[] { "action", "resource" },
                values: new object[] { "APPROVE", "REQUEST" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 7,
                columns: new[] { "action", "resource" },
                values: new object[] { "CREATE", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 8,
                columns: new[] { "action", "resource" },
                values: new object[] { "READ", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 9,
                columns: new[] { "action", "resource" },
                values: new object[] { "UPDATE", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 10,
                column: "resource",
                value: "EMPLOYEE");

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 11,
                columns: new[] { "action", "resource" },
                values: new object[] { "APPROVE", "REQUEST" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 12,
                columns: new[] { "action", "resource" },
                values: new object[] { "CREATE", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 13,
                columns: new[] { "action", "resource" },
                values: new object[] { "READ", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 14,
                columns: new[] { "action", "resource" },
                values: new object[] { "UPDATE", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 15,
                columns: new[] { "action", "resource" },
                values: new object[] { "APPROVE", "REQUEST" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 16,
                columns: new[] { "action", "resource" },
                values: new object[] { "READ", "EMPLOYEE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 17,
                column: "resource",
                value: "EMPLOYEE");

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 18,
                columns: new[] { "action", "resource" },
                values: new object[] { "APPROVE", "LEAVE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 19,
                columns: new[] { "action", "resource" },
                values: new object[] { "READ", "PAYROLL" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 20,
                columns: new[] { "action", "resource" },
                values: new object[] { "READ", "ATTENDANCE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 21,
                columns: new[] { "action", "resource" },
                values: new object[] { "READ", "MYPROFILE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 22,
                columns: new[] { "action", "resource" },
                values: new object[] { "UPDATE", "MYPROFILE" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 23,
                columns: new[] { "action", "resource" },
                values: new object[] { "CREATE", "REQUEST" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 24,
                columns: new[] { "action", "resource" },
                values: new object[] { "Manage", "System" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 25,
                columns: new[] { "action", "resource" },
                values: new object[] { "READ", "RBAC" });

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 26,
                columns: new[] { "action", "resource" },
                values: new object[] { "UPDATE", "RBAC" });
        }
    }
}
