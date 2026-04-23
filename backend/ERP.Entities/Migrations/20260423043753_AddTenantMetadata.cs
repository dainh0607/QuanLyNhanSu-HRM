using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "TenantMetadata",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: false),
                    total_employees = table.Column<int>(type: "int", nullable: false),
                    storage_usage_bytes = table.Column<long>(type: "bigint", nullable: false),
                    max_storage_quota_bytes = table.Column<long>(type: "bigint", nullable: false),
                    rental_status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    subscription_plan_name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    last_invoice_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    support_access_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    last_sync_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TenantMetadata", x => x.id);
                    table.ForeignKey(
                        name: "FK_TenantMetadata_Tenants_tenant_id",
                        column: x => x.tenant_id,
                        principalTable: "Tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_TenantMetadata_tenant_id",
                table: "TenantMetadata",
                column: "tenant_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "TenantMetadata");
        }
    }
}
