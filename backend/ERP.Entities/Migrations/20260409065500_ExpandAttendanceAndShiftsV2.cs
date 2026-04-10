using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class ExpandAttendanceAndShiftsV2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "round_checkin_minutes",
                table: "AttendancePolicies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "round_checkout_minutes",
                table: "AttendancePolicies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AttendanceLocations",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    branch_id = table.Column<int>(type: "int", nullable: false),
                    location_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    latitude = table.Column<decimal>(type: "decimal(18,10)", nullable: false),
                    longitude = table.Column<decimal>(type: "decimal(18,10)", nullable: false),
                    radius_meters = table.Column<int>(type: "int", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceLocations", x => x.id);
                    table.ForeignKey(
                        name: "FK_AttendanceLocations_Branches_branch_id",
                        column: x => x.branch_id,
                        principalTable: "Branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PublicHolidays",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    holiday_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    holiday_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_paid = table.Column<bool>(type: "bit", nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PublicHolidays", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ShiftCycleItems",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    template_id = table.Column<int>(type: "int", nullable: false),
                    day_number = table.Column<int>(type: "int", nullable: false),
                    shift_id = table.Column<int>(type: "int", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftCycleItems", x => x.id);
                    table.ForeignKey(
                        name: "FK_ShiftCycleItems_ShiftCycleTemplates_template_id",
                        column: x => x.template_id,
                        principalTable: "ShiftCycleTemplates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShiftCycleItems_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceLocations_branch_id",
                table: "AttendanceLocations",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftCycleItems_shift_id",
                table: "ShiftCycleItems",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftCycleItems_template_id",
                table: "ShiftCycleItems",
                column: "template_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AttendanceLocations");

            migrationBuilder.DropTable(
                name: "PublicHolidays");

            migrationBuilder.DropTable(
                name: "ShiftCycleItems");

            migrationBuilder.DropColumn(
                name: "round_checkin_minutes",
                table: "AttendancePolicies");

            migrationBuilder.DropColumn(
                name: "round_checkout_minutes",
                table: "AttendancePolicies");
        }
    }
}
