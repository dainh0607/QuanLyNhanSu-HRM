using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    [DbContext(typeof(AppDbContext))]
    [Migration("20260401103000_AddOriginPlaceToEmployees")]
    public partial class AddOriginPlaceToEmployees : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "origin_place",
                table: "Employees",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "origin_place",
                table: "Employees");
        }
    }
}
