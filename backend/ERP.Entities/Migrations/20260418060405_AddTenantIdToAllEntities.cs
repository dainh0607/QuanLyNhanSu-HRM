using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantIdToAllEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "WorkHistory",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "VehicleTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "UpdateHistory",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "TimeMachines",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Skills",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ShiftTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ShiftCycleAssignments",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RolePermissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RewardTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "RequestReimbursementDetails",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "PublicHolidays",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "PromotionHistory",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Permissions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "PermissionAuditLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "OvertimeTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "MealTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "MaritalStatuses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "LoginAttempts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "LocationHistory",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "LeaveTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "LeaveDurationTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "JobTitles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "InvitationTokens",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Genders",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Evaluations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "EmployeeLeaves",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "EmployeeEvaluations",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "EmployeeCourses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "EmergencyContacts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "DisciplineTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "DigitalSignatures",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Devices",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "DecisionTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Courses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ContractTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ContractSigners",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "ContractSignerPositions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "BreakGlassAccessLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AuthSessions",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AttendanceModifications",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AdvanceTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "AddressTypes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "tenant_id",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Countries",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Countries", x => x.id);
                    table.UniqueConstraint("AK_Countries_code", x => x.code);
                });

            migrationBuilder.CreateTable(
                name: "Provinces",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    country_code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Provinces", x => x.id);
                    table.UniqueConstraint("AK_Provinces_code", x => x.code);
                    table.ForeignKey(
                        name: "FK_Provinces_Countries_country_code",
                        column: x => x.country_code,
                        principalTable: "Countries",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Districts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    province_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Districts", x => x.id);
                    table.ForeignKey(
                        name: "FK_Districts_Provinces_province_code",
                        column: x => x.province_code,
                        principalTable: "Provinces",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "AddressTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "AddressTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "AddressTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: null);

            migrationBuilder.InsertData(
                table: "Countries",
                columns: new[] { "id", "created_at", "updated_at", "code", "name", "tenant_id" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "VN", "Việt Nam", null },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "US", "United States", null },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "JP", "Japan", null }
                });

            migrationBuilder.UpdateData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DecisionTypes",
                keyColumn: "id",
                keyValue: 6,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Genders",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Genders",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Genders",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "JobTitles",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "LeaveDurationTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "LeaveDurationTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "LeaveDurationTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RequestTypes",
                keyColumn: "id",
                keyValue: 5,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ShiftTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ShiftTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ShiftTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "ShiftTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "id",
                keyValue: 1,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "id",
                keyValue: 2,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "id",
                keyValue: 3,
                column: "tenant_id",
                value: null);

            migrationBuilder.UpdateData(
                table: "Skills",
                keyColumn: "id",
                keyValue: 4,
                column: "tenant_id",
                value: null);

            migrationBuilder.InsertData(
                table: "Provinces",
                columns: new[] { "id", "created_at", "updated_at", "code", "country_code", "name", "tenant_id" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "HN", "VN", "Hà Nội", null },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "HCM", "VN", "TP. Hồ Chí Minh", null },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "DN", "VN", "Đà Nẵng", null }
                });

            migrationBuilder.InsertData(
                table: "Districts",
                columns: new[] { "id", "created_at", "updated_at", "code", "name", "province_code", "tenant_id" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "HN_BD", "Ba Đình", "HN", null },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "HN_CG", "Cầu Giấy", "HN", null },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "HCM_Q1", "Quận 1", "HCM", null },
                    { 4, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "HCM_Q3", "Quận 3", "HCM", null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_Districts_province_code",
                table: "Districts",
                column: "province_code");

            migrationBuilder.CreateIndex(
                name: "IX_Provinces_country_code",
                table: "Provinces",
                column: "country_code");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Districts");

            migrationBuilder.DropTable(
                name: "Provinces");

            migrationBuilder.DropTable(
                name: "Countries");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "WorkHistory");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "VehicleTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "UpdateHistory");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "TimeMachines");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Skills");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ShiftTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ShiftCycleAssignments");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RolePermissions");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RewardTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "RequestReimbursementDetails");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "PublicHolidays");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "PromotionHistory");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Permissions");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "PermissionAuditLogs");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "OvertimeTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "MealTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "MaritalStatuses");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "LoginAttempts");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "LocationHistory");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "LeaveTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "LeaveDurationTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "JobTitles");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Genders");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Evaluations");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "EmployeeLeaves");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "EmployeeEvaluations");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "EmployeeCourses");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "EmergencyContacts");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "DisciplineTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "DigitalSignatures");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "DecisionTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Courses");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ContractTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ContractSigners");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "ContractSignerPositions");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "BreakGlassAccessLogs");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AuthSessions");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AttendanceModifications");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AdvanceTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "AddressTypes");

            migrationBuilder.DropColumn(
                name: "tenant_id",
                table: "Addresses");
        }
    }
}
