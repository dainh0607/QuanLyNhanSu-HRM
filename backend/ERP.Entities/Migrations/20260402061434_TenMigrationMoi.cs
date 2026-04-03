using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class TenMigrationMoi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Genders",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Genders",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Genders",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.InsertData(
                table: "Genders",
                columns: new[] { "id", "code", "name" },
                values: new object[,]
                {
                    { 1, "MALE", "Nam" },
                    { 2, "FEMALE", "Nữ" },
                    { 3, "OTHER", "Khác" }
                });

            migrationBuilder.InsertData(
                table: "MaritalStatuses",
                columns: new[] { "id", "code", "name" },
                values: new object[,]
                {
                    { 1, "SINGLE", "Độc thân" },
                    { 2, "MARRIED", "Đã kết hôn" },
                    { 3, "DIVORCED", "Ly hôn" },
                    { 4, "WIDOWED", "Góa" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Genders",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Genders",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Genders",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "MaritalStatuses",
                keyColumn: "id",
                keyValue: 4);

            migrationBuilder.InsertData(
                table: "Genders",
                columns: new[] { "id", "code", "name" },
                values: new object[,]
                {
                    { 1, "M", "Nam" },
                    { 2, "F", "Nữ" },
                    { 3, "O", "Khác" }
                });

            migrationBuilder.InsertData(
                table: "MaritalStatuses",
                columns: new[] { "id", "code", "name" },
                values: new object[,]
                {
                    { 1, "S", "Độc thân" },
                    { 2, "M", "Đã kết hôn" },
                    { 3, "D", "Ly hôn" },
                    { 4, "W", "Góa" }
                });
        }
    }
}
