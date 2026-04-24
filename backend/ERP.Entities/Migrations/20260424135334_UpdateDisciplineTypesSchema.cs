using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDisciplineTypesSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "code",
                table: "DisciplineTypes");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "DisciplineTypes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "keyword",
                table: "DisciplineTypes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "keyword",
                value: "KYLUAT_KHIEN_TRACH");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "keyword",
                value: "KYLUAT_CANH_CAO");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "keyword",
                value: "KYLUAT_HA_BAC_LUONG");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "keyword",
                value: "KYLUAT_CACH_CHUC");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 5,
                column: "keyword",
                value: "KYLUAT_SA_THAI");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "keyword",
                table: "DisciplineTypes");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "DisciplineTypes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "code",
                table: "DisciplineTypes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "code",
                value: "KL01");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "code",
                value: "KL02");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "code",
                value: "KL03");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "code",
                value: "KL04");

            migrationBuilder.UpdateData(
                table: "DisciplineTypes",
                keyColumn: "id",
                keyValue: 5,
                column: "code",
                value: "KL05");
        }
    }
}
