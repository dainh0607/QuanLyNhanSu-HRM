using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddAddressIndexes : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_Wards_code",
                table: "Wards",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Wards_name",
                table: "Wards",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_Provinces_code",
                table: "Provinces",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Provinces_name",
                table: "Provinces",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_Districts_code",
                table: "Districts",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Districts_name",
                table: "Districts",
                column: "name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Wards_code",
                table: "Wards");

            migrationBuilder.DropIndex(
                name: "IX_Wards_name",
                table: "Wards");

            migrationBuilder.DropIndex(
                name: "IX_Provinces_code",
                table: "Provinces");

            migrationBuilder.DropIndex(
                name: "IX_Provinces_name",
                table: "Provinces");

            migrationBuilder.DropIndex(
                name: "IX_Districts_code",
                table: "Districts");

            migrationBuilder.DropIndex(
                name: "IX_Districts_name",
                table: "Districts");
        }
    }
}
