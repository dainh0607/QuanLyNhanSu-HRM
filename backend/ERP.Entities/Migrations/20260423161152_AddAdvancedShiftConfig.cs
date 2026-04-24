using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddAdvancedShiftConfig : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "allowed_early_mins",
                table: "Shifts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "allowed_late_mins",
                table: "Shifts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "checkin_requirement",
                table: "Shifts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "checkin_window_end",
                table: "Shifts",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "checkin_window_start",
                table: "Shifts",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "checkout_requirement",
                table: "Shifts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "checkout_window_end",
                table: "Shifts",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "checkout_window_start",
                table: "Shifts",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "end_date",
                table: "Shifts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_overtime_shift",
                table: "Shifts",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "keyword",
                table: "Shifts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            // FIX: Populate keyword with unique shift_code before creating unique index
            migrationBuilder.Sql("UPDATE Shifts SET keyword = shift_code WHERE keyword = '' OR keyword IS NULL");

            migrationBuilder.AddColumn<int>(
                name: "max_early_mins",
                table: "Shifts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "max_late_mins",
                table: "Shifts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "meal_count",
                table: "Shifts",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "meal_type_id",
                table: "Shifts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<float>(
                name: "min_working_hours",
                table: "Shifts",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<float>(
                name: "standard_effort",
                table: "Shifts",
                type: "real",
                nullable: false,
                defaultValue: 0f);

            migrationBuilder.AddColumn<DateTime>(
                name: "start_date",
                table: "Shifts",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "symbol",
                table: "Shifts",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "timezone",
                table: "Shifts",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "Asia/Saigon");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_keyword",
                table: "Shifts",
                column: "keyword",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_meal_type_id",
                table: "Shifts",
                column: "meal_type_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Shifts_MealTypes_meal_type_id",
                table: "Shifts",
                column: "meal_type_id",
                principalTable: "MealTypes",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Shifts_MealTypes_meal_type_id",
                table: "Shifts");

            migrationBuilder.DropIndex(
                name: "IX_Shifts_keyword",
                table: "Shifts");

            migrationBuilder.DropIndex(
                name: "IX_Shifts_meal_type_id",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "allowed_early_mins",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "allowed_late_mins",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "checkin_requirement",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "checkin_window_end",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "checkin_window_start",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "checkout_requirement",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "checkout_window_end",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "checkout_window_start",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "end_date",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "is_overtime_shift",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "keyword",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "max_early_mins",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "max_late_mins",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "meal_count",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "meal_type_id",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "min_working_hours",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "standard_effort",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "start_date",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "symbol",
                table: "Shifts");

            migrationBuilder.DropColumn(
                name: "timezone",
                table: "Shifts");

        }
    }
}
