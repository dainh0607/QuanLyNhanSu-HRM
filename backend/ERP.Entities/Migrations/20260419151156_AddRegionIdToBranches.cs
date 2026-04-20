using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddRegionIdToBranches : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "region_id",
                table: "Branches",
                type: "int",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Branches",
                keyColumn: "id",
                keyValue: 1,
                column: "region_id",
                value: 1);

            migrationBuilder.CreateIndex(
                name: "IX_Branches_region_id",
                table: "Branches",
                column: "region_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Regions_region_id",
                table: "Branches",
                column: "region_id",
                principalTable: "Regions",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Branches_Regions_region_id",
                table: "Branches");

            migrationBuilder.DropIndex(
                name: "IX_Branches_region_id",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "region_id",
                table: "Branches");
        }
    }
}
