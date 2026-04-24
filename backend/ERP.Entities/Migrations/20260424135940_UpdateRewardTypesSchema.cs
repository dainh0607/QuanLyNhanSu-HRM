using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateRewardTypesSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "code",
                table: "RewardTypes");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "RewardTypes",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AddColumn<string>(
                name: "keyword",
                table: "RewardTypes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "keyword",
                value: "THUONG_TIEN_MAT");

            migrationBuilder.UpdateData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "keyword",
                value: "THUONG_BANG_KHEN");

            migrationBuilder.UpdateData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "keyword",
                value: "THUONG_HIEN_VAT");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "keyword",
                table: "RewardTypes");

            migrationBuilder.AlterColumn<string>(
                name: "description",
                table: "RewardTypes",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "code",
                table: "RewardTypes",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.UpdateData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "code",
                value: "KT01");

            migrationBuilder.UpdateData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "code",
                value: "KT02");

            migrationBuilder.UpdateData(
                table: "RewardTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "code",
                value: "KT03");
        }
    }
}
