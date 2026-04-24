using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddMajors : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "major_id",
                table: "Education",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Majors",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Majors", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Education_major_id",
                table: "Education",
                column: "major_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Education_Majors_major_id",
                table: "Education",
                column: "major_id",
                principalTable: "Majors",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Education_Majors_major_id",
                table: "Education");

            migrationBuilder.DropTable(
                name: "Majors");

            migrationBuilder.DropIndex(
                name: "IX_Education_major_id",
                table: "Education");

            migrationBuilder.DropColumn(
                name: "major_id",
                table: "Education");
        }
    }
}
