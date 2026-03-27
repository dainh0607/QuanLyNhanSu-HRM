using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRolesAndAddSeeding : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Roles",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<bool>(
                name: "is_active",
                table: "Roles",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "Roles",
                type: "datetime2",
                nullable: true);

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "id", "created_at", "updated_at", "description", "is_active", "name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8165), new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8396), "System Administrator", true, "Admin" },
                    { 2, new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8716), new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8717), "Department Manager", true, "Manager" },
                    { 3, new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8719), new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8719), "Regular Employee", true, "User" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "is_active",
                table: "Roles");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "Roles");
        }
    }
}
