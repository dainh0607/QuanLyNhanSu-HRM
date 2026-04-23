using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBranchHierarchyAndExtendedInfo : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "color_code",
                table: "Branches",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "country_code",
                table: "Branches",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "display_order",
                table: "Branches",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "district_code",
                table: "Branches",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "parent_id",
                table: "Branches",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone_country_prefix",
                table: "Branches",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "phone_number",
                table: "Branches",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "province_code",
                table: "Branches",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Branches",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "color_code", "country_code", "display_order", "district_code", "parent_id", "phone_country_prefix", "phone_number", "province_code" },
                values: new object[] { null, null, 0, null, null, null, null, null });

            migrationBuilder.CreateIndex(
                name: "IX_Branches_parent_id",
                table: "Branches",
                column: "parent_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Branches_Branches_parent_id",
                table: "Branches",
                column: "parent_id",
                principalTable: "Branches",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Branches_Branches_parent_id",
                table: "Branches");

            migrationBuilder.DropIndex(
                name: "IX_Branches_parent_id",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "color_code",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "country_code",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "display_order",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "district_code",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "parent_id",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "phone_country_prefix",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "phone_number",
                table: "Branches");

            migrationBuilder.DropColumn(
                name: "province_code",
                table: "Branches");
        }
    }
}
