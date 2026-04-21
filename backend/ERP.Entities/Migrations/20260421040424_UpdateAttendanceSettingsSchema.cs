using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateAttendanceSettingsSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "proxy_attendance_with_image",
                table: "AttendanceSettings",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "unrestricted_location_option",
                table: "AttendanceSettings",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "proxy_attendance_with_image",
                table: "AttendanceSettings");

            migrationBuilder.DropColumn(
                name: "unrestricted_location_option",
                table: "AttendanceSettings");
        }
    }
}
