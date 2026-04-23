using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantProfileTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantProfiles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: false),
                    company_email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    establishment_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    company_size = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    charter_capital = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    bank_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    bank_account_no = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    tax_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    address = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    country_id = table.Column<int>(type: "int", nullable: true),
                    province_id = table.Column<int>(type: "int", nullable: true),
                    district_id = table.Column<int>(type: "int", nullable: true),
                    date_format = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    time_format = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    notes = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantProfiles", x => x.id);
                    table.ForeignKey(
                        name: "FK_TenantProfiles_Tenants_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "Tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantProfiles_tenant_id",
                table: "TenantProfiles",
                column: "tenant_id",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantProfiles");
        }
    }
}
