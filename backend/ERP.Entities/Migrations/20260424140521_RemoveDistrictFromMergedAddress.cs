using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class RemoveDistrictFromMergedAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MergedWards_MergedDistricts_district_code",
                table: "MergedWards");

            migrationBuilder.DropTable(
                name: "MergedDistricts");

            migrationBuilder.RenameColumn(
                name: "district_code",
                table: "MergedWards",
                newName: "province_code");

            migrationBuilder.RenameIndex(
                name: "IX_MergedWards_district_code",
                table: "MergedWards",
                newName: "IX_MergedWards_province_code");

            migrationBuilder.AddForeignKey(
                name: "FK_MergedWards_MergedProvinces_province_code",
                table: "MergedWards",
                column: "province_code",
                principalTable: "MergedProvinces",
                principalColumn: "code",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_MergedWards_MergedProvinces_province_code",
                table: "MergedWards");

            migrationBuilder.RenameColumn(
                name: "province_code",
                table: "MergedWards",
                newName: "district_code");

            migrationBuilder.RenameIndex(
                name: "IX_MergedWards_province_code",
                table: "MergedWards",
                newName: "IX_MergedWards_district_code");

            migrationBuilder.CreateTable(
                name: "MergedDistricts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    province_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MergedDistricts", x => x.id);
                    table.UniqueConstraint("AK_MergedDistricts_code", x => x.code);
                    table.ForeignKey(
                        name: "FK_MergedDistricts_MergedProvinces_province_code",
                        column: x => x.province_code,
                        principalTable: "MergedProvinces",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_MergedDistricts_code",
                table: "MergedDistricts",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MergedDistricts_name",
                table: "MergedDistricts",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_MergedDistricts_province_code",
                table: "MergedDistricts",
                column: "province_code");

            migrationBuilder.AddForeignKey(
                name: "FK_MergedWards_MergedDistricts_district_code",
                table: "MergedWards",
                column: "district_code",
                principalTable: "MergedDistricts",
                principalColumn: "code",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
