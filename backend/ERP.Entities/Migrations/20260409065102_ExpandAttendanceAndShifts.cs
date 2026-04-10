using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class ExpandAttendanceAndShifts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<TimeSpan>(
                name: "break_end",
                table: "Shifts",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "break_start",
                table: "Shifts",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "grace_period_in",
                table: "Shifts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "grace_period_out",
                table: "Shifts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "is_overnight",
                table: "Shifts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "min_checkin_before",
                table: "Shifts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "policy_id",
                table: "AttendanceSettings",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "AttendancePolicies",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    policy_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    allow_late_minutes = table.Column<int>(type: "int", nullable: false),
                    allow_early_minutes = table.Column<int>(type: "int", nullable: false),
                    require_face_recognition = table.Column<bool>(type: "bit", nullable: false),
                    require_location_check = table.Column<bool>(type: "bit", nullable: false),
                    allow_wifi_attendance = table.Column<bool>(type: "bit", nullable: false),
                    wifi_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendancePolicies", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "DailyAttendance",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    shift_id = table.Column<int>(type: "int", nullable: true),
                    check_in_actual = table.Column<DateTime>(type: "datetime2", nullable: true),
                    check_out_actual = table.Column<DateTime>(type: "datetime2", nullable: true),
                    total_work_hours = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    late_minutes = table.Column<int>(type: "int", nullable: false),
                    early_minutes = table.Column<int>(type: "int", nullable: false),
                    overtime_hours = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    is_absent = table.Column<bool>(type: "bit", nullable: false),
                    leave_type_id = table.Column<int>(type: "int", nullable: true),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DailyAttendance", x => x.id);
                    table.ForeignKey(
                        name: "FK_DailyAttendance_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyAttendance_LeaveTypes_leave_type_id",
                        column: x => x.leave_type_id,
                        principalTable: "LeaveTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DailyAttendance_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ShiftCycleTemplates",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    template_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    cycle_days = table.Column<int>(type: "int", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftCycleTemplates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ShiftCycleAssignments",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    template_id = table.Column<int>(type: "int", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftCycleAssignments", x => x.id);
                    table.ForeignKey(
                        name: "FK_ShiftCycleAssignments_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShiftCycleAssignments_ShiftCycleTemplates_template_id",
                        column: x => x.template_id,
                        principalTable: "ShiftCycleTemplates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceSettings_policy_id",
                table: "AttendanceSettings",
                column: "policy_id");

            migrationBuilder.CreateIndex(
                name: "IX_DailyAttendance_employee_id",
                table: "DailyAttendance",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_DailyAttendance_leave_type_id",
                table: "DailyAttendance",
                column: "leave_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_DailyAttendance_shift_id",
                table: "DailyAttendance",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftCycleAssignments_employee_id",
                table: "ShiftCycleAssignments",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftCycleAssignments_template_id",
                table: "ShiftCycleAssignments",
                column: "template_id");

            migrationBuilder.AddForeignKey(
                name: "FK_AttendanceSettings_AttendancePolicies_policy_id",
                table: "AttendanceSettings",
                column: "policy_id",
                principalTable: "AttendancePolicies",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AttendanceSettings_AttendancePolicies_policy_id",
                table: "AttendanceSettings");

            migrationBuilder.DropTable(
                name: "AttendancePolicies");

            migrationBuilder.DropTable(
                name: "DailyAttendance");

            migrationBuilder.DropTable(
                name: "ShiftCycleAssignments");

            migrationBuilder.DropTable(
                name: "ShiftCycleTemplates");

            migrationBuilder.DropIndex(
                name: "IX_AttendanceSettings_policy_id",
                table: "AttendanceSettings");

            migrationBuilder.DropColumn(
                name: "break_end",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "break_start",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "grace_period_in",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "grace_period_out",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "is_overnight",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "min_checkin_before",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "policy_id",
                table: "AttendanceSettings");
        }
    }
}
