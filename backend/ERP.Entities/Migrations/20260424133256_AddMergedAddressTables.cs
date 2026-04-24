using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddMergedAddressTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "MergedProvinces",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    country_code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MergedProvinces", x => x.id);
                    table.UniqueConstraint("AK_MergedProvinces_code", x => x.code);
                });

            migrationBuilder.CreateTable(
                name: "MergedDistricts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    province_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
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

            migrationBuilder.CreateTable(
                name: "MergedWards",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    district_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MergedWards", x => x.id);
                    table.ForeignKey(
                        name: "FK_MergedWards_MergedDistricts_district_code",
                        column: x => x.district_code,
                        principalTable: "MergedDistricts",
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

            migrationBuilder.CreateIndex(
                name: "IX_MergedProvinces_code",
                table: "MergedProvinces",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MergedProvinces_name",
                table: "MergedProvinces",
                column: "name");

            migrationBuilder.CreateIndex(
                name: "IX_MergedWards_code",
                table: "MergedWards",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MergedWards_district_code",
                table: "MergedWards",
                column: "district_code");

            migrationBuilder.CreateIndex(
                name: "IX_MergedWards_name",
                table: "MergedWards",
                column: "name");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "MergedWards");

            migrationBuilder.DropTable(
                name: "MergedDistricts");

            migrationBuilder.DropTable(
                name: "MergedProvinces");
        }
    }
}
