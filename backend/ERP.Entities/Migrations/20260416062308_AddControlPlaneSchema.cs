using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddControlPlaneSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Sys_InvoiceMetadata",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    InvoiceCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WorkspaceCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BillingPeriodLabel = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AmountVnd = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PaymentGatewayRef = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    IssuedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    DueAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    SummaryNote = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sys_InvoiceMetadata", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sys_InvoiceMetadata_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Sys_SubscriptionPlans",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    MonthlyPriceVnd = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    StorageLimitGb = table.Column<int>(type: "int", nullable: false),
                    EmployeeSeatLimit = table.Column<int>(type: "int", nullable: false),
                    AdminSeatLimit = table.Column<int>(type: "int", nullable: false),
                    Modules = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Highlight = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    SupportSla = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sys_SubscriptionPlans", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sys_SupportAccessGrants",
                columns: table => new
                {
                    TicketId = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    WorkspaceCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    RequestedScope = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CustomerApprovedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ApprovedByCustomerContact = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sys_SupportAccessGrants", x => x.TicketId);
                    table.ForeignKey(
                        name: "FK_Sys_SupportAccessGrants_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Sys_WorkspaceOwnerInvitations",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CompanyName = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    WorkspaceCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OwnerFullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    OwnerEmail = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    OwnerPhone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    TargetPlanCode = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BillingCycle = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ActivationToken = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    InvitedBy = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    Note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    InvitedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastSentAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ExpiresAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ActivatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sys_WorkspaceOwnerInvitations", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Sys_TenantSubscriptions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenantId = table.Column<int>(type: "int", nullable: false),
                    PlanId = table.Column<int>(type: "int", nullable: false),
                    SubscriptionCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    OnboardingStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    BillingCycle = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NextRenewalAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LastInvoiceCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    BillingStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    StorageUsedGb = table.Column<float>(type: "real", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Sys_TenantSubscriptions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Sys_TenantSubscriptions_Sys_SubscriptionPlans_PlanId",
                        column: x => x.PlanId,
                        principalTable: "Sys_SubscriptionPlans",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Sys_TenantSubscriptions_Tenants_TenantId",
                        column: x => x.TenantId,
                        principalTable: "Tenants",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Sys_InvoiceMetadata_TenantId",
                table: "Sys_InvoiceMetadata",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Sys_SupportAccessGrants_TenantId",
                table: "Sys_SupportAccessGrants",
                column: "TenantId");

            migrationBuilder.CreateIndex(
                name: "IX_Sys_TenantSubscriptions_PlanId",
                table: "Sys_TenantSubscriptions",
                column: "PlanId");

            migrationBuilder.CreateIndex(
                name: "IX_Sys_TenantSubscriptions_TenantId",
                table: "Sys_TenantSubscriptions",
                column: "TenantId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Sys_InvoiceMetadata");

            migrationBuilder.DropTable(
                name: "Sys_SupportAccessGrants");

            migrationBuilder.DropTable(
                name: "Sys_TenantSubscriptions");

            migrationBuilder.DropTable(
                name: "Sys_WorkspaceOwnerInvitations");

            migrationBuilder.DropTable(
                name: "Sys_SubscriptionPlans");
        }
    }
}
