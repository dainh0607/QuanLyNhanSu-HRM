using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class SyncEmploymentHistoryAndMissingColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "secondary_job_title_id",
                table: "Employees",
                type: "int",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "EmploymentHistoryLogs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    effective_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    decision_type_id = table.Column<int>(type: "int", nullable: true),
                    contract_type_id = table.Column<int>(type: "int", nullable: true),
                    decision_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    work_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    province_id = table.Column<int>(type: "int", nullable: true),
                    district_id = table.Column<int>(type: "int", nullable: true),
                    change_type = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmploymentHistoryLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_EmploymentHistoryLogs_ContractTypes_contract_type_id",
                        column: x => x.contract_type_id,
                        principalTable: "ContractTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentHistoryLogs_DecisionTypes_decision_type_id",
                        column: x => x.decision_type_id,
                        principalTable: "DecisionTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentHistoryLogs_Districts_district_id",
                        column: x => x.district_id,
                        principalTable: "Districts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentHistoryLogs_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmploymentHistoryLogs_Provinces_province_id",
                        column: x => x.province_id,
                        principalTable: "Provinces",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Employees_secondary_job_title_id",
                table: "Employees",
                column: "secondary_job_title_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentHistoryLogs_contract_type_id",
                table: "EmploymentHistoryLogs",
                column: "contract_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentHistoryLogs_decision_type_id",
                table: "EmploymentHistoryLogs",
                column: "decision_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentHistoryLogs_district_id",
                table: "EmploymentHistoryLogs",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentHistoryLogs_employee_id",
                table: "EmploymentHistoryLogs",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmploymentHistoryLogs_province_id",
                table: "EmploymentHistoryLogs",
                column: "province_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Employees_JobTitles_secondary_job_title_id",
                table: "Employees",
                column: "secondary_job_title_id",
                principalTable: "JobTitles",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Employees_JobTitles_secondary_job_title_id",
                table: "Employees");

            migrationBuilder.DropTable(
                name: "EmploymentHistoryLogs");

            migrationBuilder.DropIndex(
                name: "IX_Employees_secondary_job_title_id",
                table: "Employees");

            migrationBuilder.DropColumn(
                name: "secondary_job_title_id",
                table: "Employees");
        }
    }
}
