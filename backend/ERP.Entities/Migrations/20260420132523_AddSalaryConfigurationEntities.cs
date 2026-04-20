using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddSalaryConfigurationEntities : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "salary_grade",
                table: "Salaries");

            migrationBuilder.DropColumn(
                name: "income_name",
                table: "OtherIncomes");

            migrationBuilder.DropColumn(
                name: "allowance_name",
                table: "Allowances");

            migrationBuilder.AddColumn<int>(
                name: "salary_grade_id",
                table: "Salaries",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "income_type_id",
                table: "OtherIncomes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "allowance_type_id",
                table: "Allowances",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "AllowanceTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AllowanceTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "IncomeTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IncomeTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "SalaryGrades",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalaryGrades", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "VariableSalaries",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    tenant_id = table.Column<int>(type: "int", nullable: true),
                    salary_id = table.Column<int>(type: "int", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    salary_grade_id = table.Column<int>(type: "int", nullable: false),
                    note = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VariableSalaries", x => x.id);
                    table.ForeignKey(
                        name: "FK_VariableSalaries_Salaries_salary_id",
                        column: x => x.salary_id,
                        principalTable: "Salaries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_VariableSalaries_SalaryGrades_salary_grade_id",
                        column: x => x.salary_grade_id,
                        principalTable: "SalaryGrades",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Salaries_salary_grade_id",
                table: "Salaries",
                column: "salary_grade_id");

            migrationBuilder.CreateIndex(
                name: "IX_OtherIncomes_income_type_id",
                table: "OtherIncomes",
                column: "income_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_Allowances_allowance_type_id",
                table: "Allowances",
                column: "allowance_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_VariableSalaries_salary_grade_id",
                table: "VariableSalaries",
                column: "salary_grade_id");

            migrationBuilder.CreateIndex(
                name: "IX_VariableSalaries_salary_id",
                table: "VariableSalaries",
                column: "salary_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Allowances_AllowanceTypes_allowance_type_id",
                table: "Allowances",
                column: "allowance_type_id",
                principalTable: "AllowanceTypes",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_OtherIncomes_IncomeTypes_income_type_id",
                table: "OtherIncomes",
                column: "income_type_id",
                principalTable: "IncomeTypes",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Salaries_SalaryGrades_salary_grade_id",
                table: "Salaries",
                column: "salary_grade_id",
                principalTable: "SalaryGrades",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Allowances_AllowanceTypes_allowance_type_id",
                table: "Allowances");

            migrationBuilder.DropForeignKey(
                name: "FK_OtherIncomes_IncomeTypes_income_type_id",
                table: "OtherIncomes");

            migrationBuilder.DropForeignKey(
                name: "FK_Salaries_SalaryGrades_salary_grade_id",
                table: "Salaries");

            migrationBuilder.DropTable(
                name: "AllowanceTypes");

            migrationBuilder.DropTable(
                name: "IncomeTypes");

            migrationBuilder.DropTable(
                name: "VariableSalaries");

            migrationBuilder.DropTable(
                name: "SalaryGrades");

            migrationBuilder.DropIndex(
                name: "IX_Salaries_salary_grade_id",
                table: "Salaries");

            migrationBuilder.DropIndex(
                name: "IX_OtherIncomes_income_type_id",
                table: "OtherIncomes");

            migrationBuilder.DropIndex(
                name: "IX_Allowances_allowance_type_id",
                table: "Allowances");

            migrationBuilder.DropColumn(
                name: "salary_grade_id",
                table: "Salaries");

            migrationBuilder.DropColumn(
                name: "income_type_id",
                table: "OtherIncomes");

            migrationBuilder.DropColumn(
                name: "allowance_type_id",
                table: "Allowances");

            migrationBuilder.AddColumn<string>(
                name: "salary_grade",
                table: "Salaries",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "income_name",
                table: "OtherIncomes",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "allowance_name",
                table: "Allowances",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");
        }
    }
}
