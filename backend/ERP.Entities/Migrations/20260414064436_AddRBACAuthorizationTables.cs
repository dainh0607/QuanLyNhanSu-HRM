using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddRBACAuthorizationTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "failed_login_count",
                table: "Users",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "force_password_change_after_emergency",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_break_glass_account",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "is_locked",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_emergency_access_at",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_failed_login_time",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "last_password_change",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "locked_until",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "password_expires_at",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "requires_password_change",
                table: "Users",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "assigned_by_user_id",
                table: "UserRoles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "assignment_reason",
                table: "UserRoles",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "branch_id",
                table: "UserRoles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "department_id",
                table: "UserRoles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "id",
                table: "UserRoles",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "region_id",
                table: "UserRoles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "UserRoles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "valid_from",
                table: "UserRoles",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "valid_to",
                table: "UserRoles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "ActionPermissions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_id = table.Column<int>(type: "int", nullable: false),
                    action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    resource = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    allowed_scope = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    condition = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ActionPermissions", x => x.id);
                    table.ForeignKey(
                        name: "FK_ActionPermissions_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BreakGlassAccessLogs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    login_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    logout_time = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ip_address = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    user_agent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    actions_performed = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    reason_for_access = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    approved_by_user_id = table.Column<int>(type: "int", nullable: true),
                    approval_time = table.Column<DateTime>(type: "datetime2", nullable: true),
                    password_changed_after_access = table.Column<bool>(type: "bit", nullable: false),
                    new_password_hash = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    password_change_forced_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_account_locked_after = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BreakGlassAccessLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_BreakGlassAccessLogs_Users_approved_by_user_id",
                        column: x => x.approved_by_user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_BreakGlassAccessLogs_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LoginAttempts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    attempt_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ip_address = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    username_attempted = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    is_success = table.Column<bool>(type: "bit", nullable: false),
                    reason_for_failure = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    user_agent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    failed_attempt_count = table.Column<int>(type: "int", nullable: false),
                    triggered_account_lockout = table.Column<bool>(type: "bit", nullable: false),
                    locked_until = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LoginAttempts", x => x.id);
                    table.ForeignKey(
                        name: "FK_LoginAttempts_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PermissionAuditLogs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    action_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    target_user_id = table.Column<int>(type: "int", nullable: false),
                    performed_by_user_id = table.Column<int>(type: "int", nullable: false),
                    role_id = table.Column<int>(type: "int", nullable: true),
                    old_role_id = table.Column<int>(type: "int", nullable: true),
                    scope_details = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    old_scope_details = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    ip_address = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    user_agent = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_immutable = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PermissionAuditLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_PermissionAuditLogs_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PermissionAuditLogs_Users_performed_by_user_id",
                        column: x => x.performed_by_user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PermissionAuditLogs_Users_target_user_id",
                        column: x => x.target_user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestTypeApprovers",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    request_type_id = table.Column<int>(type: "int", nullable: false),
                    role_id = table.Column<int>(type: "int", nullable: false),
                    approval_level = table.Column<int>(type: "int", nullable: false),
                    max_approval_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    max_approval_days = table.Column<int>(type: "int", nullable: true),
                    is_mandatory = table.Column<bool>(type: "bit", nullable: false),
                    auto_approve_when_under_threshold = table.Column<bool>(type: "bit", nullable: false),
                    approver_scope = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestTypeApprovers", x => x.id);
                    table.ForeignKey(
                        name: "FK_RequestTypeApprovers_RequestTypes_request_type_id",
                        column: x => x.request_type_id,
                        principalTable: "RequestTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestTypeApprovers_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ResourcePermissions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_id = table.Column<int>(type: "int", nullable: false),
                    resource_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    scope_level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ResourcePermissions", x => x.id);
                    table.ForeignKey(
                        name: "FK_ResourcePermissions_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RoleScopes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    role_id = table.Column<int>(type: "int", nullable: false),
                    scope_level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    is_hierarchical = table.Column<bool>(type: "bit", nullable: false),
                    cross_region_modules = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RoleScopes", x => x.id);
                    table.ForeignKey(
                        name: "FK_RoleScopes_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "description", "name" },
                values: new object[] { "Quản trị hệ thống cao nhất", "Quản trị" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "description", "name" },
                values: new object[] { "Thành viên Ban giám đốc", "Ban giám đốc" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "description", "name" },
                values: new object[] { "Quản lý theo vùng/miền", "Quản lý vùng" });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "id", "created_at", "updated_at", "description", "is_active", "name" },
                values: new object[,]
                {
                    { 4, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Quản lý tại chi nhánh", true, "Quản lý chi nhánh" },
                    { 5, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Quản lý phòng ban/bộ phận", true, "Quản lý bộ phận" },
                    { 6, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Quản trị các phân hệ nghiệp vụ", true, "Quản trị phân hệ" },
                    { 7, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Nhân viên chính thức", true, "Nhân viên" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_assigned_by_user_id",
                table: "UserRoles",
                column: "assigned_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_branch_id",
                table: "UserRoles",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_department_id",
                table: "UserRoles",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_region_id",
                table: "UserRoles",
                column: "region_id");

            migrationBuilder.CreateIndex(
                name: "IX_ActionPermissions_role_id",
                table: "ActionPermissions",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_BreakGlassAccessLogs_approved_by_user_id",
                table: "BreakGlassAccessLogs",
                column: "approved_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_BreakGlassAccessLogs_user_id",
                table: "BreakGlassAccessLogs",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_LoginAttempts_user_id",
                table: "LoginAttempts",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_performed_by_user_id",
                table: "PermissionAuditLogs",
                column: "performed_by_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_role_id",
                table: "PermissionAuditLogs",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_PermissionAuditLogs_target_user_id",
                table: "PermissionAuditLogs",
                column: "target_user_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestTypeApprovers_request_type_id",
                table: "RequestTypeApprovers",
                column: "request_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestTypeApprovers_role_id",
                table: "RequestTypeApprovers",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_ResourcePermissions_role_id",
                table: "ResourcePermissions",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_RoleScopes_role_id",
                table: "RoleScopes",
                column: "role_id");

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Branches_branch_id",
                table: "UserRoles",
                column: "branch_id",
                principalTable: "Branches",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Departments_department_id",
                table: "UserRoles",
                column: "department_id",
                principalTable: "Departments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Regions_region_id",
                table: "UserRoles",
                column: "region_id",
                principalTable: "Regions",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserRoles_Users_assigned_by_user_id",
                table: "UserRoles",
                column: "assigned_by_user_id",
                principalTable: "Users",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Branches_branch_id",
                table: "UserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Departments_department_id",
                table: "UserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Regions_region_id",
                table: "UserRoles");

            migrationBuilder.DropForeignKey(
                name: "FK_UserRoles_Users_assigned_by_user_id",
                table: "UserRoles");

            migrationBuilder.DropTable(
                name: "ActionPermissions");

            migrationBuilder.DropTable(
                name: "BreakGlassAccessLogs");

            migrationBuilder.DropTable(
                name: "LoginAttempts");

            migrationBuilder.DropTable(
                name: "PermissionAuditLogs");

            migrationBuilder.DropTable(
                name: "RequestTypeApprovers");

            migrationBuilder.DropTable(
                name: "ResourcePermissions");

            migrationBuilder.DropTable(
                name: "RoleScopes");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_assigned_by_user_id",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_branch_id",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_department_id",
                table: "UserRoles");

            migrationBuilder.DropIndex(
                name: "IX_UserRoles_region_id",
                table: "UserRoles");

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 6);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 7);

            migrationBuilder.DropColumn(
                name: "failed_login_count",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "force_password_change_after_emergency",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "is_break_glass_account",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "is_locked",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "last_emergency_access_at",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "last_failed_login_time",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "last_password_change",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "locked_until",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "password_expires_at",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "requires_password_change",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "assigned_by_user_id",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "assignment_reason",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "branch_id",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "department_id",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "id",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "region_id",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "valid_from",
                table: "UserRoles");

            migrationBuilder.DropColumn(
                name: "valid_to",
                table: "UserRoles");

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "description", "name" },
                values: new object[] { "System Administrator", "Admin" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "description", "name" },
                values: new object[] { "Department Manager", "Manager" });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "description", "name" },
                values: new object[] { "Regular Employee", "User" });
        }
    }
}
