using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddIdentityFieldsToEmployee : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AuthSessions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    user_id = table.Column<int>(type: "int", nullable: false),
                    session_id = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: false),
                    refresh_token_hash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    csrf_token_hash = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    expires_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    last_used_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    revoked_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    replaced_by_session_id = table.Column<string>(type: "nvarchar(64)", maxLength: 64, nullable: true),
                    ip_address = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: true),
                    user_agent = table.Column<string>(type: "nvarchar(512)", maxLength: 512, nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AuthSessions", x => x.id);
                    table.ForeignKey(
                        name: "FK_AuthSessions_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "name",
                value: "Hợp đồng thử việc");

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "name",
                value: "Hợp đồng lao động xác định thời hạn (12 tháng)");

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "name",
                value: "Hợp đồng lao động xác định thời hạn (36 tháng)");

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "name",
                value: "Hợp đồng lao động không xác định thời hạn");

            migrationBuilder.InsertData(
                table: "ContractTypes",
                columns: new[] { "id", "name" },
                values: new object[] { 5, "Hợp đồng khoán việc / Cộng tác viên" });

            migrationBuilder.CreateIndex(
                name: "IX_AuthSessions_refresh_token_hash",
                table: "AuthSessions",
                column: "refresh_token_hash",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuthSessions_session_id",
                table: "AuthSessions",
                column: "session_id",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_AuthSessions_user_id_is_active",
                table: "AuthSessions",
                columns: new[] { "user_id", "is_active" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AuthSessions");

            migrationBuilder.DeleteData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 5);

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "name",
                value: "Thử việc");

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "name",
                value: "Hợp đồng 1 năm");

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "name",
                value: "Hợp đồng 3 năm");

            migrationBuilder.UpdateData(
                table: "ContractTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "name",
                value: "Hợp đồng không thời hạn");
        }
    }
}
