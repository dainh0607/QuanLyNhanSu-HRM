using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateOvertimeTypesSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "code",
                table: "OvertimeTypes");

            migrationBuilder.DropColumn(
                name: "description",
                table: "OvertimeTypes");

            migrationBuilder.AddColumn<string>(
                name: "keyword",
                table: "OvertimeTypes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "monthly_limit_hours",
                table: "OvertimeTypes",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "notes",
                table: "OvertimeTypes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "rate_percentage",
                table: "OvertimeTypes",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "yearly_limit_hours",
                table: "OvertimeTypes",
                type: "decimal(18,2)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "keyword",
                table: "OvertimeTypes");

            migrationBuilder.DropColumn(
                name: "monthly_limit_hours",
                table: "OvertimeTypes");

            migrationBuilder.DropColumn(
                name: "notes",
                table: "OvertimeTypes");

            migrationBuilder.DropColumn(
                name: "rate_percentage",
                table: "OvertimeTypes");

            migrationBuilder.DropColumn(
                name: "yearly_limit_hours",
                table: "OvertimeTypes");

            migrationBuilder.AddColumn<string>(
                name: "code",
                table: "OvertimeTypes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "description",
                table: "OvertimeTypes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");
        }
    }
}
