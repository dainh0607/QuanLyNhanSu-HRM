using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRolesAndAddSeedin2g : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc) });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8165), new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8396) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8716), new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8717) });

            migrationBuilder.UpdateData(
                table: "Roles",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "created_at", "updated_at" },
                values: new object[] { new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8719), new DateTime(2026, 3, 27, 7, 39, 35, 961, DateTimeKind.Utc).AddTicks(8719) });
        }
    }
}
