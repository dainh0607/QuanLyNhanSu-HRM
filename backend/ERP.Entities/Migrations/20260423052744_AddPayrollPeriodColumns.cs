using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddPayrollPeriodColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "applicable_departments",
                table: "PayrollPeriods",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "applicable_job_titles",
                table: "PayrollPeriods",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "branch_id",
                table: "InvitationTokens",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "message",
                table: "InvitationTokens",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "region_id",
                table: "InvitationTokens",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "role_id",
                table: "InvitationTokens",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "scope_level",
                table: "InvitationTokens",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Sys_Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceId = table.Column<int>(type: "int", nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    AmountVnd = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    PaymentSource = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ExternalReference = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    ProcessedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sys_Transactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sys_Transactions_Sys_InvoiceMetadata_InvoiceId",
                        column: x => x.InvoiceId,
                        principalTable: "Sys_InvoiceMetadata",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Sys_Transactions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_branch_id",
                table: "InvitationTokens",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_region_id",
                table: "InvitationTokens",
                column: "region_id");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_role_id",
                table: "InvitationTokens",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_Sys_Transactions_InvoiceId",
                table: "Sys_Transactions",
                column: "InvoiceId");

            migrationBuilder.CreateIndex(
                name: "IX_Sys_Transactions_TenantId",
                table: "Sys_Transactions",
                column: "TenantId");

            migrationBuilder.AddForeignKey(
                name: "FK_InvitationTokens_Branches_branch_id",
                table: "InvitationTokens",
                column: "branch_id",
                principalTable: "Branches",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvitationTokens_Regions_region_id",
                table: "InvitationTokens",
                column: "region_id",
                principalTable: "Regions",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvitationTokens_Roles_role_id",
                table: "InvitationTokens",
                column: "role_id",
                principalTable: "Roles",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvitationTokens_Branches_branch_id",
                table: "InvitationTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_InvitationTokens_Regions_region_id",
                table: "InvitationTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_InvitationTokens_Roles_role_id",
                table: "InvitationTokens");

            migrationBuilder.DropTable(
                name: "Sys_Transactions");

            migrationBuilder.DropIndex(
                name: "IX_InvitationTokens_branch_id",
                table: "InvitationTokens");

            migrationBuilder.DropIndex(
                name: "IX_InvitationTokens_region_id",
                table: "InvitationTokens");

            migrationBuilder.DropIndex(
                name: "IX_InvitationTokens_role_id",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "applicable_departments",
                table: "PayrollPeriods");

            migrationBuilder.DropColumn(
                name: "applicable_job_titles",
                table: "PayrollPeriods");

            migrationBuilder.DropColumn(
                name: "branch_id",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "message",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "region_id",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "role_id",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "scope_level",
                table: "InvitationTokens");
        }
    }
}
