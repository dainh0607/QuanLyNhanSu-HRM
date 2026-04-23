using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTenantProfileColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "country_id",
                table: "TenantProfiles");

            migrationBuilder.DropColumn(
                name: "district_id",
                table: "TenantProfiles");

            migrationBuilder.DropColumn(
                name: "province_id",
                table: "TenantProfiles");

            migrationBuilder.AddColumn<string>(
                name: "country_code",
                table: "TenantProfiles",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "district_code",
                table: "TenantProfiles",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "province_code",
                table: "TenantProfiles",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "country_code",
                table: "TenantProfiles");

            migrationBuilder.DropColumn(
                name: "district_code",
                table: "TenantProfiles");

            migrationBuilder.DropColumn(
                name: "province_code",
                table: "TenantProfiles");

            migrationBuilder.AddColumn<int>(
                name: "country_id",
                table: "TenantProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "district_id",
                table: "TenantProfiles",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "province_id",
                table: "TenantProfiles",
                type: "int",
                nullable: true);
        }
    }
}
