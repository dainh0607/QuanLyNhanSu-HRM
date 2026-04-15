using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRolesAndUserRolesForRBAC : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "scope_level",
                table: "RoleScopes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RoleScopes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_system_role",
                table: "Roles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Roles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ResourcePermissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestTypeApprovers",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ActionPermissions",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 6,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 7,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 8,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 9,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 10,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 11,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 12,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 13,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 14,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 15,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 16,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 17,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 18,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 19,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 20,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 21,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 22,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ActionPermissions",
                keyColumn: "id",
                keyValue: 23,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypeApprovers",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypeApprovers",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypeApprovers",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypeApprovers",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypeApprovers",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 6,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 7,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 8,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 9,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 10,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 11,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 12,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 13,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 14,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 15,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 16,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 17,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ResourcePermissions",
                keyColumn: "id",
                keyValue: 18,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RoleScopes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RoleScopes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RoleScopes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RoleScopes",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RoleScopes",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RoleScopes",
                keyColumn: "id",
                keyValue: 6,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RoleScopes",
                keyColumn: "id",
                keyValue: 7,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "is_system_role", "tenant_id" },
                values: new object[] { true, null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "is_system_role", "tenant_id" },
                values: new object[] { true, null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "is_system_role", "tenant_id" },
                values: new object[] { true, null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 4,
                columns: new[] { "is_system_role", "tenant_id" },
                values: new object[] { true, null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 5,
                columns: new[] { "is_system_role", "tenant_id" },
                values: new object[] { true, null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 6,
                columns: new[] { "is_system_role", "tenant_id" },
                values: new object[] { true, null });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 7,
                columns: new[] { "is_system_role", "tenant_id" },
                values: new object[] { true, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RoleScopes");

            migrationBuilder.DropColumn(
                name: "is_system_role",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ResourcePermissions");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestTypeApprovers");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ActionPermissions");

            migrationBuilder.AlterColumn<string>(
                name: "scope_level",
                table: "RoleScopes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);
        }
    }
}
