using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class Initial_Infrastructure : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Addresses",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    address_line = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ward = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    district = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    city = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    country = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    postal_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Addresses", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "AddressTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AddressTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "AdvanceTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdvanceTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Assets",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    asset_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    asset_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    total_quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Assets", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Branches",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Branches", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Certificates",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    certificate_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Certificates", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ContractTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContractTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Courses",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    course_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Courses", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "DecisionTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DecisionTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Deductions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Deductions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Departments",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    parent_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Departments", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "DisciplineTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DisciplineTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Evaluations",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    evaluation_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Evaluations", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Genders",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Genders", x => x.id);
                    table.UniqueConstraint("AK_Genders_code", x => x.code);
                });

            migrationBuilder.CreateTable(
                name: "JobTitles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_JobTitles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "LeaveDurationTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    hours = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveDurationTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "LeaveTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    is_paid = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "MaritalStatuses",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaritalStatuses", x => x.id);
                    table.UniqueConstraint("AK_MaritalStatuses_code", x => x.code);
                });

            migrationBuilder.CreateTable(
                name: "MealTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MealTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "OvertimeTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OvertimeTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "PayrollPeriods",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollPeriods", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Permissions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    resource = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    action = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Permissions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Regions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Regions", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "RequestReimbursementDetails",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    reimbursement_id = table.Column<int>(type: "int", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestReimbursementDetails", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "RequestTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    category = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    workflow_id = table.Column<int>(type: "int", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "RewardTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RewardTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Roles", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "ShiftTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "Skills",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    skill_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Skills", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "TaxBrackets",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    from_income = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    to_income = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    tax_rate = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    effective_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    expiry_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxBrackets", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "TaxTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaxTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "TimeMachines",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    machine_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    machine_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TimeMachines", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "VehicleTypes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VehicleTypes", x => x.id);
                });

            migrationBuilder.CreateTable(
                name: "SalaryGradeConfig",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    job_title_id = table.Column<int>(type: "int", nullable: false),
                    grade_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    base_salary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    coefficient = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    effective_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    expiry_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SalaryGradeConfig", x => x.id);
                    table.ForeignKey(
                        name: "FK_SalaryGradeConfig_JobTitles_job_title_id",
                        column: x => x.job_title_id,
                        principalTable: "JobTitles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Employees",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    full_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    birth_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    gender = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    display_order = table.Column<int>(type: "int", nullable: true),
                    email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    home_phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    facebook = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    identity_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    identity_issue_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    identity_issue_place = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    passport = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    ethnicity = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    religion = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    nationality = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    tax_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    marital_status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    union_member = table.Column<bool>(type: "bit", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    work_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    seniority_months = table.Column<int>(type: "int", nullable: true),
                    late_early_allowed = table.Column<int>(type: "int", nullable: true),
                    late_early_note = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    is_resigned = table.Column<bool>(type: "bit", nullable: false),
                    resignation_reason = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    region_id = table.Column<int>(type: "int", nullable: true),
                    branch_id = table.Column<int>(type: "int", nullable: true),
                    secondary_branch_id = table.Column<int>(type: "int", nullable: true),
                    department_id = table.Column<int>(type: "int", nullable: true),
                    secondary_department_id = table.Column<int>(type: "int", nullable: true),
                    job_title_id = table.Column<int>(type: "int", nullable: true),
                    manager_id = table.Column<int>(type: "int", nullable: true),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    is_department_head = table.Column<bool>(type: "bit", nullable: false),
                    gender_code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    marital_status_code = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: true),
                    contract_sign_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    contract_expiry_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    work_email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    avatar = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true),
                    probation_start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    probation_end_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    official_start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Employees", x => x.id);
                    table.ForeignKey(
                        name: "FK_Employees_Branches_branch_id",
                        column: x => x.branch_id,
                        principalTable: "Branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Branches_secondary_branch_id",
                        column: x => x.secondary_branch_id,
                        principalTable: "Branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_department_id",
                        column: x => x.department_id,
                        principalTable: "Departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Departments_secondary_department_id",
                        column: x => x.secondary_department_id,
                        principalTable: "Departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Employees_manager_id",
                        column: x => x.manager_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Genders_gender_code",
                        column: x => x.gender_code,
                        principalTable: "Genders",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_JobTitles_job_title_id",
                        column: x => x.job_title_id,
                        principalTable: "JobTitles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_MaritalStatuses_marital_status_code",
                        column: x => x.marital_status_code,
                        principalTable: "MaritalStatuses",
                        principalColumn: "code",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Employees_Regions_region_id",
                        column: x => x.region_id,
                        principalTable: "Regions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RolePermissions",
                columns: table => new
                {
                    role_id = table.Column<int>(type: "int", nullable: false),
                    permission_id = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RolePermissions", x => new { x.role_id, x.permission_id });
                    table.ForeignKey(
                        name: "FK_RolePermissions_Permissions_permission_id",
                        column: x => x.permission_id,
                        principalTable: "Permissions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RolePermissions_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Shifts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    shift_code = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    shift_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    start_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    end_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    color = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    shift_type_id = table.Column<int>(type: "int", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Shifts", x => x.id);
                    table.ForeignKey(
                        name: "FK_Shifts_ShiftTypes_shift_type_id",
                        column: x => x.shift_type_id,
                        principalTable: "ShiftTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AssetAllocations",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    asset_id = table.Column<int>(type: "int", nullable: false),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    allocation_code = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    allocation_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    allocation_time = table.Column<TimeSpan>(type: "time", nullable: true),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    location = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    handover_place = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    deposit = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    return_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AssetAllocations", x => x.id);
                    table.ForeignKey(
                        name: "FK_AssetAllocations_Assets_asset_id",
                        column: x => x.asset_id,
                        principalTable: "Assets",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AssetAllocations_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceLogs",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    machine_id = table.Column<int>(type: "int", nullable: true),
                    type = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceLogs", x => x.id);
                    table.ForeignKey(
                        name: "FK_AttendanceLogs_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceLogs_TimeMachines_machine_id",
                        column: x => x.machine_id,
                        principalTable: "TimeMachines",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceSettings",
                columns: table => new
                {
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    multi_device_login = table.Column<bool>(type: "bit", nullable: false),
                    track_location = table.Column<bool>(type: "bit", nullable: false),
                    no_attendance = table.Column<bool>(type: "bit", nullable: false),
                    unrestricted_attendance = table.Column<bool>(type: "bit", nullable: false),
                    allow_late_in_out = table.Column<bool>(type: "bit", nullable: false),
                    allow_early_in_out = table.Column<bool>(type: "bit", nullable: false),
                    auto_attendance = table.Column<bool>(type: "bit", nullable: false),
                    auto_checkout = table.Column<bool>(type: "bit", nullable: false),
                    require_face_in = table.Column<bool>(type: "bit", nullable: false),
                    require_face_out = table.Column<bool>(type: "bit", nullable: false),
                    proxy_attendance = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceSettings", x => x.employee_id);
                    table.ForeignKey(
                        name: "FK_AttendanceSettings_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "BankAccounts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    account_holder = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    account_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    bank_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    branch = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BankAccounts", x => x.id);
                    table.ForeignKey(
                        name: "FK_BankAccounts_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Contracts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    contract_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    contract_type_id = table.Column<int>(type: "int", nullable: true),
                    sign_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    effective_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    expiry_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    signed_by = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    tax_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Contracts", x => x.id);
                    table.ForeignKey(
                        name: "FK_Contracts_ContractTypes_contract_type_id",
                        column: x => x.contract_type_id,
                        principalTable: "ContractTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Contracts_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Dependents",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    full_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    birth_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    identity_number = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    relationship = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    permanent_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    temporary_address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    dependent_duration = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    reason = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dependents", x => x.id);
                    table.ForeignKey(
                        name: "FK_Dependents_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Devices",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    imei = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    device_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    version = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    os = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    device_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Devices", x => x.id);
                    table.ForeignKey(
                        name: "FK_Devices_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DigitalSignatures",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    signature_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    signature_data = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    is_default = table.Column<bool>(type: "bit", nullable: false),
                    certification_info = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DigitalSignatures", x => x.id);
                    table.ForeignKey(
                        name: "FK_DigitalSignatures_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Education",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    level = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    major = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    institution = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    issue_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Education", x => x.id);
                    table.ForeignKey(
                        name: "FK_Education_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmergencyContacts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    relationship = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    mobile_phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    home_phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmergencyContacts", x => x.id);
                    table.ForeignKey(
                        name: "FK_EmergencyContacts_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeAddresses",
                columns: table => new
                {
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    address_id = table.Column<int>(type: "int", nullable: false),
                    address_type_id = table.Column<int>(type: "int", nullable: false),
                    is_current = table.Column<bool>(type: "bit", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeAddresses", x => new { x.employee_id, x.address_id });
                    table.ForeignKey(
                        name: "FK_EmployeeAddresses_AddressTypes_address_type_id",
                        column: x => x.address_type_id,
                        principalTable: "AddressTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeAddresses_Addresses_address_id",
                        column: x => x.address_id,
                        principalTable: "Addresses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeAddresses_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeCertificates",
                columns: table => new
                {
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    certificate_id = table.Column<int>(type: "int", nullable: false),
                    issue_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeCertificates", x => new { x.employee_id, x.certificate_id });
                    table.ForeignKey(
                        name: "FK_EmployeeCertificates_Certificates_certificate_id",
                        column: x => x.certificate_id,
                        principalTable: "Certificates",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeCertificates_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeCourses",
                columns: table => new
                {
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    course_id = table.Column<int>(type: "int", nullable: false),
                    completion_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeCourses", x => new { x.employee_id, x.course_id });
                    table.ForeignKey(
                        name: "FK_EmployeeCourses_Courses_course_id",
                        column: x => x.course_id,
                        principalTable: "Courses",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeCourses_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeEvaluations",
                columns: table => new
                {
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    evaluation_id = table.Column<int>(type: "int", nullable: false),
                    evaluation_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    result = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeEvaluations", x => new { x.employee_id, x.evaluation_id });
                    table.ForeignKey(
                        name: "FK_EmployeeEvaluations_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeEvaluations_Evaluations_evaluation_id",
                        column: x => x.evaluation_id,
                        principalTable: "Evaluations",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeLeaves",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    leave_type_id = table.Column<int>(type: "int", nullable: false),
                    total_days = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    used_days = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    remaining_days = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    year = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeLeaves", x => x.id);
                    table.ForeignKey(
                        name: "FK_EmployeeLeaves_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeLeaves_LeaveTypes_leave_type_id",
                        column: x => x.leave_type_id,
                        principalTable: "LeaveTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "EmployeeSkills",
                columns: table => new
                {
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    skill_id = table.Column<int>(type: "int", nullable: false),
                    level = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_EmployeeSkills", x => new { x.employee_id, x.skill_id });
                    table.ForeignKey(
                        name: "FK_EmployeeSkills_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_EmployeeSkills_Skills_skill_id",
                        column: x => x.skill_id,
                        principalTable: "Skills",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HealthRecords",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    height = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    weight = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    blood_type = table.Column<string>(type: "nvarchar(5)", maxLength: 5, nullable: false),
                    congenital_disease = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    chronic_disease = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    health_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    check_date = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HealthRecords", x => x.id);
                    table.ForeignKey(
                        name: "FK_HealthRecords_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Insurances",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    social_insurance_no = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    health_insurance_no = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    position = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    medical_history = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    maternity_regime = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    registration_place = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    join_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    salary_for_insurance = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    union_fee = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    company_pays_health = table.Column<bool>(type: "bit", nullable: true),
                    company_pays_social = table.Column<bool>(type: "bit", nullable: true),
                    company_pays_unemployment = table.Column<bool>(type: "bit", nullable: true),
                    employee_pays_health = table.Column<bool>(type: "bit", nullable: true),
                    employee_pays_social = table.Column<bool>(type: "bit", nullable: true),
                    employee_pays_unemployment = table.Column<bool>(type: "bit", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    birth_place_address_id = table.Column<int>(type: "int", nullable: true),
                    residence_address_id = table.Column<int>(type: "int", nullable: true),
                    contact_address_id = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Insurances", x => x.id);
                    table.ForeignKey(
                        name: "FK_Insurances_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LocationHistory",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    latitude = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    longitude = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    timestamp = table.Column<DateTime>(type: "datetime2", nullable: false),
                    source = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LocationHistory", x => x.id);
                    table.ForeignKey(
                        name: "FK_LocationHistory_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "MonthlyAttendanceSummary",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    year_month = table.Column<int>(type: "int", nullable: false),
                    total_work_days = table.Column<int>(type: "int", nullable: false),
                    total_work_hours = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_overtime_hours = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_late_minutes = table.Column<int>(type: "int", nullable: false),
                    total_early_minutes = table.Column<int>(type: "int", nullable: false),
                    total_absent_days = table.Column<int>(type: "int", nullable: false),
                    total_paid_leave_days = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_unpaid_leave_days = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MonthlyAttendanceSummary", x => x.id);
                    table.ForeignKey(
                        name: "FK_MonthlyAttendanceSummary_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Payrolls",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    period_id = table.Column<int>(type: "int", nullable: false),
                    base_salary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_allowances = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_deductions = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    net_salary = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    approved_by = table.Column<int>(type: "int", nullable: true),
                    approved_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Payrolls", x => x.id);
                    table.ForeignKey(
                        name: "FK_Payrolls_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Payrolls_PayrollPeriods_period_id",
                        column: x => x.period_id,
                        principalTable: "PayrollPeriods",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PromotionHistory",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    effective_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    decision_type_id = table.Column<int>(type: "int", nullable: true),
                    contract_type_id = table.Column<int>(type: "int", nullable: true),
                    decision_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    work_status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    city = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    district = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    branch_id = table.Column<int>(type: "int", nullable: true),
                    department_id = table.Column<int>(type: "int", nullable: true),
                    job_title_id = table.Column<int>(type: "int", nullable: true),
                    payment_method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    salary_grade = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    salary_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    allowance = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    other_income = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PromotionHistory", x => x.id);
                    table.ForeignKey(
                        name: "FK_PromotionHistory_Branches_branch_id",
                        column: x => x.branch_id,
                        principalTable: "Branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PromotionHistory_ContractTypes_contract_type_id",
                        column: x => x.contract_type_id,
                        principalTable: "ContractTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PromotionHistory_DecisionTypes_decision_type_id",
                        column: x => x.decision_type_id,
                        principalTable: "DecisionTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PromotionHistory_Departments_department_id",
                        column: x => x.department_id,
                        principalTable: "Departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PromotionHistory_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PromotionHistory_JobTitles_job_title_id",
                        column: x => x.job_title_id,
                        principalTable: "JobTitles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Requests",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    request_type_id = table.Column<int>(type: "int", nullable: false),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    created_by = table.Column<int>(type: "int", nullable: false),
                    approved_by = table.Column<int>(type: "int", nullable: true),
                    approved_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    rejection_reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Requests", x => x.id);
                    table.ForeignKey(
                        name: "FK_Requests_Employees_approved_by",
                        column: x => x.approved_by,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Requests_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Requests_RequestTypes_request_type_id",
                        column: x => x.request_type_id,
                        principalTable: "RequestTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Salaries",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    salary_grade = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    base_salary = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Salaries", x => x.id);
                    table.ForeignKey(
                        name: "FK_Salaries_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    username = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    firebase_uid = table.Column<string>(type: "nvarchar(128)", maxLength: 128, nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.id);
                    table.ForeignKey(
                        name: "FK_Users_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "WorkHistory",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    company_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    job_title = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    work_duration = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    is_current = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_WorkHistory", x => x.id);
                    table.ForeignKey(
                        name: "FK_WorkHistory_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OpenShifts",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    shift_id = table.Column<int>(type: "int", nullable: false),
                    branch_id = table.Column<int>(type: "int", nullable: false),
                    department_id = table.Column<int>(type: "int", nullable: false),
                    job_title_id = table.Column<int>(type: "int", nullable: false),
                    required_quantity = table.Column<int>(type: "int", nullable: false),
                    auto_publish = table.Column<bool>(type: "bit", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    open_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    close_date = table.Column<DateTime>(type: "datetime2", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OpenShifts", x => x.id);
                    table.ForeignKey(
                        name: "FK_OpenShifts_Branches_branch_id",
                        column: x => x.branch_id,
                        principalTable: "Branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpenShifts_Departments_department_id",
                        column: x => x.department_id,
                        principalTable: "Departments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpenShifts_JobTitles_job_title_id",
                        column: x => x.job_title_id,
                        principalTable: "JobTitles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_OpenShifts_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ShiftAssignments",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    shift_id = table.Column<int>(type: "int", nullable: false),
                    assignment_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    is_published = table.Column<bool>(type: "bit", nullable: false),
                    created_by = table.Column<int>(type: "int", nullable: false),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftAssignments", x => x.id);
                    table.ForeignKey(
                        name: "FK_ShiftAssignments_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ShiftAssignments_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PayrollDeductions",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    payroll_id = table.Column<int>(type: "int", nullable: false),
                    deduction_id = table.Column<int>(type: "int", nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollDeductions", x => x.id);
                    table.ForeignKey(
                        name: "FK_PayrollDeductions_Deductions_deduction_id",
                        column: x => x.deduction_id,
                        principalTable: "Deductions",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_PayrollDeductions_Payrolls_payroll_id",
                        column: x => x.payroll_id,
                        principalTable: "Payrolls",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "PayrollDetails",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    payroll_id = table.Column<int>(type: "int", nullable: false),
                    component_type = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    component_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PayrollDetails", x => x.id);
                    table.ForeignKey(
                        name: "FK_PayrollDetails_Payrolls_payroll_id",
                        column: x => x.payroll_id,
                        principalTable: "Payrolls",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LeaveRequests",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    leave_type_id = table.Column<int>(type: "int", nullable: false),
                    duration_type_id = table.Column<int>(type: "int", nullable: true),
                    number_of_hours = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    start_shift_id = table.Column<int>(type: "int", nullable: true),
                    end_shift_id = table.Column<int>(type: "int", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    handover_employee_id = table.Column<int>(type: "int", nullable: true),
                    handover_phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    handover_note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    approved_by = table.Column<int>(type: "int", nullable: true),
                    approved_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    request_id = table.Column<int>(type: "int", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LeaveRequests", x => x.id);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_LeaveDurationTypes_duration_type_id",
                        column: x => x.duration_type_id,
                        principalTable: "LeaveDurationTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_LeaveTypes_leave_type_id",
                        column: x => x.leave_type_id,
                        principalTable: "LeaveTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_LeaveRequests_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestApprovals",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    request_id = table.Column<int>(type: "int", nullable: false),
                    approver_id = table.Column<int>(type: "int", nullable: false),
                    step_order = table.Column<int>(type: "int", nullable: false),
                    status = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    approved_at = table.Column<DateTime>(type: "datetime2", nullable: true),
                    comment = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestApprovals", x => x.id);
                    table.ForeignKey(
                        name: "FK_RequestApprovals_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestBorrows",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestBorrows", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestBorrows_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestDeviceChanges",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestDeviceChanges", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestDeviceChanges_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestDisciplines",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    discipline_type_id = table.Column<int>(type: "int", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    decision_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestDisciplines", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestDisciplines_DisciplineTypes_discipline_type_id",
                        column: x => x.discipline_type_id,
                        principalTable: "DisciplineTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestDisciplines_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestExpensePayments",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    expense_type_id = table.Column<int>(type: "int", nullable: true),
                    description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestExpensePayments", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestExpensePayments_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestLateEarly",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    shift_id = table.Column<int>(type: "int", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestLateEarly", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestLateEarly_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestLateEarly_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestMeals",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    shift_id = table.Column<int>(type: "int", nullable: false),
                    number_of_meals = table.Column<int>(type: "int", nullable: false),
                    meal_type_id = table.Column<int>(type: "int", nullable: true),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestMeals", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestMeals_MealTypes_meal_type_id",
                        column: x => x.meal_type_id,
                        principalTable: "MealTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestMeals_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestMeals_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestOvertime",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    overtime_type_id = table.Column<int>(type: "int", nullable: true),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    overtime_hours = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    branch_id = table.Column<int>(type: "int", nullable: true),
                    break_start = table.Column<TimeSpan>(type: "time", nullable: true),
                    break_end = table.Column<TimeSpan>(type: "time", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    handover_note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestOvertime", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestOvertime_Branches_branch_id",
                        column: x => x.branch_id,
                        principalTable: "Branches",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestOvertime_OvertimeTypes_overtime_type_id",
                        column: x => x.overtime_type_id,
                        principalTable: "OvertimeTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestOvertime_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestPayments",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    payment_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    payment_purpose = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    account_holder = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    bank_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    account_number = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestPayments", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestPayments_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestPurchaseRequests",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    request_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    request_type_id = table.Column<int>(type: "int", nullable: true),
                    payment_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    purpose = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestPurchaseRequests", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestPurchaseRequests_RequestTypes_request_type_id",
                        column: x => x.request_type_id,
                        principalTable: "RequestTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestPurchaseRequests_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestPurchases",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    purchase_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestPurchases", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestPurchases_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestReimbursements",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    request_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    group_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    request_type_id = table.Column<int>(type: "int", nullable: true),
                    payment_purpose = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    payment_method = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    reimbursement_deadline = table.Column<DateTime>(type: "datetime2", nullable: true),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestReimbursements", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestReimbursements_RequestTypes_request_type_id",
                        column: x => x.request_type_id,
                        principalTable: "RequestTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestReimbursements_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestResignations",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    resignation_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    handover_employee_id = table.Column<int>(type: "int", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestResignations", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestResignations_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestRewards",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    reward_type_id = table.Column<int>(type: "int", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    decision_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestRewards", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestRewards_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestRewards_RewardTypes_reward_type_id",
                        column: x => x.reward_type_id,
                        principalTable: "RewardTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestSalaryAdvances",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    title = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    advance_type_id = table.Column<int>(type: "int", nullable: true),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    decision_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestSalaryAdvances", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestSalaryAdvances_AdvanceTypes_advance_type_id",
                        column: x => x.advance_type_id,
                        principalTable: "AdvanceTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestSalaryAdvances_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestShiftChange",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    shift_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    shift_id = table.Column<int>(type: "int", nullable: false),
                    new_start_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    start_next_day = table.Column<bool>(type: "bit", nullable: false),
                    new_end_time = table.Column<TimeSpan>(type: "time", nullable: false),
                    end_next_day = table.Column<bool>(type: "bit", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestShiftChange", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestShiftChange_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestShiftChange_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestShiftRegister",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    shift_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    shift_id = table.Column<int>(type: "int", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestShiftRegister", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestShiftRegister_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestShiftRegister_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestShiftSwap",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    shift_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    shift_id = table.Column<int>(type: "int", nullable: false),
                    target_employee_id = table.Column<int>(type: "int", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestShiftSwap", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestShiftSwap_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestShiftSwap_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestVehicleUses",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    vehicle_type_id = table.Column<int>(type: "int", nullable: true),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    pickup_point = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    destination = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    attachment = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestVehicleUses", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestVehicleUses_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestVehicleUses_VehicleTypes_vehicle_type_id",
                        column: x => x.vehicle_type_id,
                        principalTable: "VehicleTypes",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestWorkTrips",
                columns: table => new
                {
                    request_id = table.Column<int>(type: "int", nullable: false),
                    start_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    end_date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    location = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    shift_id = table.Column<int>(type: "int", nullable: true),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestWorkTrips", x => x.request_id);
                    table.ForeignKey(
                        name: "FK_RequestWorkTrips_Requests_request_id",
                        column: x => x.request_id,
                        principalTable: "Requests",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_RequestWorkTrips_Shifts_shift_id",
                        column: x => x.shift_id,
                        principalTable: "Shifts",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Allowances",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    salary_id = table.Column<int>(type: "int", nullable: false),
                    allowance_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Allowances", x => x.id);
                    table.ForeignKey(
                        name: "FK_Allowances_Salaries_salary_id",
                        column: x => x.salary_id,
                        principalTable: "Salaries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "OtherIncomes",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    salary_id = table.Column<int>(type: "int", nullable: false),
                    income_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OtherIncomes", x => x.id);
                    table.ForeignKey(
                        name: "FK_OtherIncomes_Salaries_salary_id",
                        column: x => x.salary_id,
                        principalTable: "Salaries",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UpdateHistory",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    table_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    record_id = table.Column<int>(type: "int", nullable: false),
                    action = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    user_id = table.Column<int>(type: "int", nullable: true),
                    change_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    old_values = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    new_values = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UpdateHistory", x => x.id);
                    table.ForeignKey(
                        name: "FK_UpdateHistory_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    user_id = table.Column<int>(type: "int", nullable: false),
                    role_id = table.Column<int>(type: "int", nullable: false),
                    is_active = table.Column<bool>(type: "bit", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    updated_at = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserRoles", x => new { x.user_id, x.role_id });
                    table.ForeignKey(
                        name: "FK_UserRoles_Roles_role_id",
                        column: x => x.role_id,
                        principalTable: "Roles",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_UserRoles_Users_user_id",
                        column: x => x.user_id,
                        principalTable: "Users",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceRecords",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    employee_id = table.Column<int>(type: "int", nullable: false),
                    shift_assignment_id = table.Column<int>(type: "int", nullable: true),
                    record_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    record_type = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    device_id = table.Column<int>(type: "int", nullable: true),
                    location_lat = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    location_lng = table.Column<decimal>(type: "decimal(18,2)", nullable: true),
                    face_image = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    verified = table.Column<bool>(type: "bit", nullable: false),
                    source = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceRecords", x => x.id);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_Devices_device_id",
                        column: x => x.device_id,
                        principalTable: "Devices",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_Employees_employee_id",
                        column: x => x.employee_id,
                        principalTable: "Employees",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_AttendanceRecords_ShiftAssignments_shift_assignment_id",
                        column: x => x.shift_assignment_id,
                        principalTable: "ShiftAssignments",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestBorrowDetails",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    borrow_id = table.Column<int>(type: "int", nullable: false),
                    item_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    quantity = table.Column<int>(type: "int", nullable: false),
                    note = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestBorrowDetails", x => x.id);
                    table.ForeignKey(
                        name: "FK_RequestBorrowDetails_RequestBorrows_borrow_id",
                        column: x => x.borrow_id,
                        principalTable: "RequestBorrows",
                        principalColumn: "request_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestPurchaseRequestDetails",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    purchase_request_id = table.Column<int>(type: "int", nullable: false),
                    content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestPurchaseRequestDetails", x => x.id);
                    table.ForeignKey(
                        name: "FK_RequestPurchaseRequestDetails_RequestPurchaseRequests_purchase_request_id",
                        column: x => x.purchase_request_id,
                        principalTable: "RequestPurchaseRequests",
                        principalColumn: "request_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "RequestPurchaseDetails",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    purchase_id = table.Column<int>(type: "int", nullable: false),
                    item_name = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    quantity = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    unit_price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    total_amount = table.Column<decimal>(type: "decimal(18,2)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_RequestPurchaseDetails", x => x.id);
                    table.ForeignKey(
                        name: "FK_RequestPurchaseDetails_RequestPurchases_purchase_id",
                        column: x => x.purchase_id,
                        principalTable: "RequestPurchases",
                        principalColumn: "request_id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "AttendanceModifications",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    attendance_record_id = table.Column<int>(type: "int", nullable: false),
                    modified_by = table.Column<int>(type: "int", nullable: false),
                    modified_at = table.Column<DateTime>(type: "datetime2", nullable: false),
                    old_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    new_time = table.Column<DateTime>(type: "datetime2", nullable: false),
                    reason = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AttendanceModifications", x => x.id);
                    table.ForeignKey(
                        name: "FK_AttendanceModifications_AttendanceRecords_attendance_record_id",
                        column: x => x.attendance_record_id,
                        principalTable: "AttendanceRecords",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.InsertData(
                table: "AddressTypes",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { 1, "Thường trú" },
                    { 2, "Tạm trú" }
                });

            migrationBuilder.InsertData(
                table: "Branches",
                columns: new[] { "id", "address", "code", "name" },
                values: new object[] { 1, "Hà Nội", "HO", "Trụ sở chính" });

            migrationBuilder.InsertData(
                table: "ContractTypes",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { 1, "Thử việc" },
                    { 2, "Hợp đồng 1 năm" },
                    { 3, "Hợp đồng 3 năm" },
                    { 4, "Hợp đồng không thời hạn" }
                });

            migrationBuilder.InsertData(
                table: "DecisionTypes",
                columns: new[] { "id", "name" },
                values: new object[,]
                {
                    { 1, "Quyết định Tuyển dụng" },
                    { 2, "Quyết định Bổ nhiệm" },
                    { 3, "Quyết định Tăng lương" },
                    { 4, "Quyết định Khen thưởng" },
                    { 5, "Quyết định Kỷ luật" },
                    { 6, "Quyết định Nghỉ việc" }
                });

            migrationBuilder.InsertData(
                table: "Departments",
                columns: new[] { "id", "code", "name", "parent_id" },
                values: new object[,]
                {
                    { 1, "HR", "Phòng Hành chính Nhân sự", null },
                    { 2, "IT", "Phòng Công nghệ", null },
                    { 3, "SALES", "Phòng Kinh doanh", null },
                    { 4, "ACC", "Phòng Kế toán", null }
                });

            migrationBuilder.InsertData(
                table: "DisciplineTypes",
                columns: new[] { "id", "created_at", "updated_at", "code", "description", "display_order", "is_active", "name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL01", "Khiển trách bằng văn bản", null, true, "Khiển trách" },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL02", "Cảnh cáo trước toàn công ty", null, true, "Cảnh cáo" },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL03", "Giảm bậc lương hiện tại", null, true, "Hạ bậc lương" },
                    { 4, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL04", "Miễn nhiệm chức vụ hiện tại", null, true, "Cách chức" },
                    { 5, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KL05", "Chấm dứt hợp đồng lao động", null, true, "Sa thải" }
                });

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
                table: "JobTitles",
                columns: new[] { "id", "code", "name" },
                values: new object[,]
                {
                    { 1, "STAFF", "Nhân viên" },
                    { 2, "TEAMLEAD", "Trưởng nhóm" },
                    { 3, "HEAD", "Trưởng phòng" },
                    { 4, "DIRECTOR", "Giám đốc" }
                });

            migrationBuilder.InsertData(
                table: "LeaveDurationTypes",
                columns: new[] { "id", "code", "hours", "name" },
                values: new object[,]
                {
                    { 1, "FULL", 8m, "Cả ngày" },
                    { 2, "MORNING", 4m, "Sáng" },
                    { 3, "AFTERNOON", 4m, "Chiều" }
                });

            migrationBuilder.InsertData(
                table: "LeaveTypes",
                columns: new[] { "id", "is_paid", "name" },
                values: new object[,]
                {
                    { 1, true, "Nghỉ phép năm" },
                    { 2, true, "Nghỉ ốm" },
                    { 3, false, "Nghỉ không lương" },
                    { 4, true, "Nghỉ thai sản" },
                    { 5, true, "Nghỉ hiếu hỉ" }
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

            migrationBuilder.InsertData(
                table: "Regions",
                columns: new[] { "id", "code", "name" },
                values: new object[,]
                {
                    { 1, "NORTH", "Miền Bắc" },
                    { 2, "CENTRAL", "Miền Trung" },
                    { 3, "SOUTH", "Miền Nam" }
                });

            migrationBuilder.InsertData(
                table: "RequestTypes",
                columns: new[] { "id", "created_at", "updated_at", "category", "code", "is_active", "name", "workflow_id" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "LEAVE", "REQ_LEAVE", true, "Yêu cầu Nghỉ phép", null },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "ATTENDANCE", "REQ_OT", true, "Yêu cầu Làm thêm", null },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "ATTENDANCE", "REQ_SHIFT", true, "Yêu cầu Đổi ca", null },
                    { 4, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "WORK", "REQ_TRIP", true, "Yêu cầu Công tác", null },
                    { 5, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "PAYROLL", "REQ_ADVANCE", true, "Yêu cầu Tạm ứng lương", null }
                });

            migrationBuilder.InsertData(
                table: "RewardTypes",
                columns: new[] { "id", "created_at", "updated_at", "code", "description", "display_order", "is_active", "name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KT01", "Thưởng bằng tiền mặt", null, true, "Tiền mặt" },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KT02", "Thanh thưởng bằng giấy khen", null, true, "Bằng khen" },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "KT03", "Thưởng bằng quà tặng/hiện vật", null, true, "Hiện vật" }
                });

            migrationBuilder.InsertData(
                table: "Roles",
                columns: new[] { "id", "created_at", "updated_at", "description", "is_active", "name" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "System Administrator", true, "Admin" },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Department Manager", true, "Manager" },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), "Regular Employee", true, "User" }
                });

            migrationBuilder.InsertData(
                table: "ShiftTypes",
                columns: new[] { "id", "description", "name" },
                values: new object[,]
                {
                    { 1, "Làm việc giờ hành chính (08:00 - 17:00)", "Ca hành chính" },
                    { 2, "Ca làm việc buổi sáng", "Ca sáng (06:00 - 14:00)" },
                    { 3, "Ca làm việc buổi chiều", "Ca chiều (14:00 - 22:00)" },
                    { 4, "Ca làm việc ban đêm", "Ca đêm (22:00 - 06:00)" }
                });

            migrationBuilder.InsertData(
                table: "Skills",
                columns: new[] { "id", "description", "skill_name" },
                values: new object[,]
                {
                    { 1, "Ngôn ngữ quốc tế", "Tiếng Anh" },
                    { 2, "Kỹ năng văn phòng", "Microsoft Office" },
                    { 3, "Kỹ năng dữ liệu", "SQL / Database" },
                    { 4, "Project Management", "Quản lý dự án" }
                });

            migrationBuilder.InsertData(
                table: "TaxBrackets",
                columns: new[] { "id", "effective_date", "expiry_date", "from_income", "tax_rate", "to_income" },
                values: new object[,]
                {
                    { 1, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 0m, 5m, 5000000m },
                    { 2, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 5000001m, 10m, 10000000m },
                    { 3, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 10000001m, 15m, 18000000m },
                    { 4, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 18000001m, 20m, 32000000m },
                    { 5, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 32000001m, 25m, 52000000m },
                    { 6, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 52000001m, 30m, 80000000m },
                    { 7, new DateTime(2026, 3, 27, 0, 0, 0, 0, DateTimeKind.Utc), null, 80000001m, 35m, null }
                });

            migrationBuilder.InsertData(
                table: "TaxTypes",
                columns: new[] { "id", "code", "is_active", "name" },
                values: new object[] { 1, "PIT", true, "Thuế thu nhập cá nhân" });

            migrationBuilder.CreateIndex(
                name: "IX_Allowances_salary_id",
                table: "Allowances",
                column: "salary_id");

            migrationBuilder.CreateIndex(
                name: "IX_AssetAllocations_asset_id",
                table: "AssetAllocations",
                column: "asset_id");

            migrationBuilder.CreateIndex(
                name: "IX_AssetAllocations_employee_id",
                table: "AssetAllocations",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceLogs_employee_id",
                table: "AttendanceLogs",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceLogs_machine_id",
                table: "AttendanceLogs",
                column: "machine_id");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceModifications_attendance_record_id",
                table: "AttendanceModifications",
                column: "attendance_record_id");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_device_id",
                table: "AttendanceRecords",
                column: "device_id");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_employee_id",
                table: "AttendanceRecords",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_AttendanceRecords_shift_assignment_id",
                table: "AttendanceRecords",
                column: "shift_assignment_id");

            migrationBuilder.CreateIndex(
                name: "IX_BankAccounts_employee_id",
                table: "BankAccounts",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_contract_type_id",
                table: "Contracts",
                column: "contract_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_Contracts_employee_id",
                table: "Contracts",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_Dependents_employee_id",
                table: "Dependents",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_Devices_employee_id",
                table: "Devices",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_DigitalSignatures_employee_id",
                table: "DigitalSignatures",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_Education_employee_id",
                table: "Education",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmergencyContacts_employee_id",
                table: "EmergencyContacts",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAddresses_address_id",
                table: "EmployeeAddresses",
                column: "address_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeAddresses_address_type_id",
                table: "EmployeeAddresses",
                column: "address_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeCertificates_certificate_id",
                table: "EmployeeCertificates",
                column: "certificate_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeCourses_course_id",
                table: "EmployeeCourses",
                column: "course_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeEvaluations_evaluation_id",
                table: "EmployeeEvaluations",
                column: "evaluation_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeLeaves_employee_id",
                table: "EmployeeLeaves",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeLeaves_leave_type_id",
                table: "EmployeeLeaves",
                column: "leave_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_branch_id",
                table: "Employees",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_department_id",
                table: "Employees",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_gender_code",
                table: "Employees",
                column: "gender_code");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_job_title_id",
                table: "Employees",
                column: "job_title_id");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_manager_id",
                table: "Employees",
                column: "manager_id");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_marital_status_code",
                table: "Employees",
                column: "marital_status_code");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_region_id",
                table: "Employees",
                column: "region_id");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_secondary_branch_id",
                table: "Employees",
                column: "secondary_branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_Employees_secondary_department_id",
                table: "Employees",
                column: "secondary_department_id");

            migrationBuilder.CreateIndex(
                name: "IX_EmployeeSkills_skill_id",
                table: "EmployeeSkills",
                column: "skill_id");

            migrationBuilder.CreateIndex(
                name: "IX_Genders_code",
                table: "Genders",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HealthRecords_employee_id",
                table: "HealthRecords",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_Insurances_employee_id",
                table: "Insurances",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_duration_type_id",
                table: "LeaveRequests",
                column: "duration_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_employee_id",
                table: "LeaveRequests",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_leave_type_id",
                table: "LeaveRequests",
                column: "leave_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_LeaveRequests_request_id",
                table: "LeaveRequests",
                column: "request_id");

            migrationBuilder.CreateIndex(
                name: "IX_LocationHistory_employee_id",
                table: "LocationHistory",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_MaritalStatuses_code",
                table: "MaritalStatuses",
                column: "code",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_MonthlyAttendanceSummary_employee_id",
                table: "MonthlyAttendanceSummary",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_OpenShifts_branch_id",
                table: "OpenShifts",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_OpenShifts_department_id",
                table: "OpenShifts",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_OpenShifts_job_title_id",
                table: "OpenShifts",
                column: "job_title_id");

            migrationBuilder.CreateIndex(
                name: "IX_OpenShifts_shift_id",
                table: "OpenShifts",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_OtherIncomes_salary_id",
                table: "OtherIncomes",
                column: "salary_id");

            migrationBuilder.CreateIndex(
                name: "IX_PayrollDeductions_deduction_id",
                table: "PayrollDeductions",
                column: "deduction_id");

            migrationBuilder.CreateIndex(
                name: "IX_PayrollDeductions_payroll_id",
                table: "PayrollDeductions",
                column: "payroll_id");

            migrationBuilder.CreateIndex(
                name: "IX_PayrollDetails_payroll_id",
                table: "PayrollDetails",
                column: "payroll_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payrolls_employee_id",
                table: "Payrolls",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_Payrolls_period_id",
                table: "Payrolls",
                column: "period_id");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionHistory_branch_id",
                table: "PromotionHistory",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionHistory_contract_type_id",
                table: "PromotionHistory",
                column: "contract_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionHistory_decision_type_id",
                table: "PromotionHistory",
                column: "decision_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionHistory_department_id",
                table: "PromotionHistory",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionHistory_employee_id",
                table: "PromotionHistory",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_PromotionHistory_job_title_id",
                table: "PromotionHistory",
                column: "job_title_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestApprovals_request_id",
                table: "RequestApprovals",
                column: "request_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestBorrowDetails_borrow_id",
                table: "RequestBorrowDetails",
                column: "borrow_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestDisciplines_discipline_type_id",
                table: "RequestDisciplines",
                column: "discipline_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestLateEarly_shift_id",
                table: "RequestLateEarly",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestMeals_meal_type_id",
                table: "RequestMeals",
                column: "meal_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestMeals_shift_id",
                table: "RequestMeals",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestOvertime_branch_id",
                table: "RequestOvertime",
                column: "branch_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestOvertime_overtime_type_id",
                table: "RequestOvertime",
                column: "overtime_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestPurchaseDetails_purchase_id",
                table: "RequestPurchaseDetails",
                column: "purchase_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestPurchaseRequestDetails_purchase_request_id",
                table: "RequestPurchaseRequestDetails",
                column: "purchase_request_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestPurchaseRequests_request_type_id",
                table: "RequestPurchaseRequests",
                column: "request_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestReimbursements_request_type_id",
                table: "RequestReimbursements",
                column: "request_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestRewards_reward_type_id",
                table: "RequestRewards",
                column: "reward_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_approved_by",
                table: "Requests",
                column: "approved_by");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_employee_id",
                table: "Requests",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_Requests_request_type_id",
                table: "Requests",
                column: "request_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestSalaryAdvances_advance_type_id",
                table: "RequestSalaryAdvances",
                column: "advance_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestShiftChange_shift_id",
                table: "RequestShiftChange",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestShiftRegister_shift_id",
                table: "RequestShiftRegister",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestShiftSwap_shift_id",
                table: "RequestShiftSwap",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestVehicleUses_vehicle_type_id",
                table: "RequestVehicleUses",
                column: "vehicle_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_RequestWorkTrips_shift_id",
                table: "RequestWorkTrips",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_RolePermissions_permission_id",
                table: "RolePermissions",
                column: "permission_id");

            migrationBuilder.CreateIndex(
                name: "IX_Salaries_employee_id",
                table: "Salaries",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_SalaryGradeConfig_job_title_id",
                table: "SalaryGradeConfig",
                column: "job_title_id");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftAssignments_employee_id",
                table: "ShiftAssignments",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_ShiftAssignments_shift_id",
                table: "ShiftAssignments",
                column: "shift_id");

            migrationBuilder.CreateIndex(
                name: "IX_Shifts_shift_type_id",
                table: "Shifts",
                column: "shift_type_id");

            migrationBuilder.CreateIndex(
                name: "IX_UpdateHistory_user_id",
                table: "UpdateHistory",
                column: "user_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_role_id",
                table: "UserRoles",
                column: "role_id");

            migrationBuilder.CreateIndex(
                name: "IX_Users_employee_id",
                table: "Users",
                column: "employee_id");

            migrationBuilder.CreateIndex(
                name: "IX_WorkHistory_employee_id",
                table: "WorkHistory",
                column: "employee_id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Allowances");

            migrationBuilder.DropTable(
                name: "AssetAllocations");

            migrationBuilder.DropTable(
                name: "AttendanceLogs");

            migrationBuilder.DropTable(
                name: "AttendanceModifications");

            migrationBuilder.DropTable(
                name: "AttendanceSettings");

            migrationBuilder.DropTable(
                name: "BankAccounts");

            migrationBuilder.DropTable(
                name: "Contracts");

            migrationBuilder.DropTable(
                name: "Dependents");

            migrationBuilder.DropTable(
                name: "DigitalSignatures");

            migrationBuilder.DropTable(
                name: "Education");

            migrationBuilder.DropTable(
                name: "EmergencyContacts");

            migrationBuilder.DropTable(
                name: "EmployeeAddresses");

            migrationBuilder.DropTable(
                name: "EmployeeCertificates");

            migrationBuilder.DropTable(
                name: "EmployeeCourses");

            migrationBuilder.DropTable(
                name: "EmployeeEvaluations");

            migrationBuilder.DropTable(
                name: "EmployeeLeaves");

            migrationBuilder.DropTable(
                name: "EmployeeSkills");

            migrationBuilder.DropTable(
                name: "HealthRecords");

            migrationBuilder.DropTable(
                name: "Insurances");

            migrationBuilder.DropTable(
                name: "LeaveRequests");

            migrationBuilder.DropTable(
                name: "LocationHistory");

            migrationBuilder.DropTable(
                name: "MonthlyAttendanceSummary");

            migrationBuilder.DropTable(
                name: "OpenShifts");

            migrationBuilder.DropTable(
                name: "OtherIncomes");

            migrationBuilder.DropTable(
                name: "PayrollDeductions");

            migrationBuilder.DropTable(
                name: "PayrollDetails");

            migrationBuilder.DropTable(
                name: "PromotionHistory");

            migrationBuilder.DropTable(
                name: "RequestApprovals");

            migrationBuilder.DropTable(
                name: "RequestBorrowDetails");

            migrationBuilder.DropTable(
                name: "RequestDeviceChanges");

            migrationBuilder.DropTable(
                name: "RequestDisciplines");

            migrationBuilder.DropTable(
                name: "RequestExpensePayments");

            migrationBuilder.DropTable(
                name: "RequestLateEarly");

            migrationBuilder.DropTable(
                name: "RequestMeals");

            migrationBuilder.DropTable(
                name: "RequestOvertime");

            migrationBuilder.DropTable(
                name: "RequestPayments");

            migrationBuilder.DropTable(
                name: "RequestPurchaseDetails");

            migrationBuilder.DropTable(
                name: "RequestPurchaseRequestDetails");

            migrationBuilder.DropTable(
                name: "RequestReimbursementDetails");

            migrationBuilder.DropTable(
                name: "RequestReimbursements");

            migrationBuilder.DropTable(
                name: "RequestResignations");

            migrationBuilder.DropTable(
                name: "RequestRewards");

            migrationBuilder.DropTable(
                name: "RequestSalaryAdvances");

            migrationBuilder.DropTable(
                name: "RequestShiftChange");

            migrationBuilder.DropTable(
                name: "RequestShiftRegister");

            migrationBuilder.DropTable(
                name: "RequestShiftSwap");

            migrationBuilder.DropTable(
                name: "RequestVehicleUses");

            migrationBuilder.DropTable(
                name: "RequestWorkTrips");

            migrationBuilder.DropTable(
                name: "RolePermissions");

            migrationBuilder.DropTable(
                name: "SalaryGradeConfig");

            migrationBuilder.DropTable(
                name: "TaxBrackets");

            migrationBuilder.DropTable(
                name: "TaxTypes");

            migrationBuilder.DropTable(
                name: "UpdateHistory");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "WorkHistory");

            migrationBuilder.DropTable(
                name: "Assets");

            migrationBuilder.DropTable(
                name: "TimeMachines");

            migrationBuilder.DropTable(
                name: "AttendanceRecords");

            migrationBuilder.DropTable(
                name: "AddressTypes");

            migrationBuilder.DropTable(
                name: "Addresses");

            migrationBuilder.DropTable(
                name: "Certificates");

            migrationBuilder.DropTable(
                name: "Courses");

            migrationBuilder.DropTable(
                name: "Evaluations");

            migrationBuilder.DropTable(
                name: "Skills");

            migrationBuilder.DropTable(
                name: "LeaveDurationTypes");

            migrationBuilder.DropTable(
                name: "LeaveTypes");

            migrationBuilder.DropTable(
                name: "Salaries");

            migrationBuilder.DropTable(
                name: "Deductions");

            migrationBuilder.DropTable(
                name: "Payrolls");

            migrationBuilder.DropTable(
                name: "ContractTypes");

            migrationBuilder.DropTable(
                name: "DecisionTypes");

            migrationBuilder.DropTable(
                name: "RequestBorrows");

            migrationBuilder.DropTable(
                name: "DisciplineTypes");

            migrationBuilder.DropTable(
                name: "MealTypes");

            migrationBuilder.DropTable(
                name: "OvertimeTypes");

            migrationBuilder.DropTable(
                name: "RequestPurchases");

            migrationBuilder.DropTable(
                name: "RequestPurchaseRequests");

            migrationBuilder.DropTable(
                name: "RewardTypes");

            migrationBuilder.DropTable(
                name: "AdvanceTypes");

            migrationBuilder.DropTable(
                name: "VehicleTypes");

            migrationBuilder.DropTable(
                name: "Permissions");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Users");

            migrationBuilder.DropTable(
                name: "Devices");

            migrationBuilder.DropTable(
                name: "ShiftAssignments");

            migrationBuilder.DropTable(
                name: "PayrollPeriods");

            migrationBuilder.DropTable(
                name: "Requests");

            migrationBuilder.DropTable(
                name: "Shifts");

            migrationBuilder.DropTable(
                name: "Employees");

            migrationBuilder.DropTable(
                name: "RequestTypes");

            migrationBuilder.DropTable(
                name: "ShiftTypes");

            migrationBuilder.DropTable(
                name: "Branches");

            migrationBuilder.DropTable(
                name: "Departments");

            migrationBuilder.DropTable(
                name: "Genders");

            migrationBuilder.DropTable(
                name: "JobTitles");

            migrationBuilder.DropTable(
                name: "MaritalStatuses");

            migrationBuilder.DropTable(
                name: "Regions");
        }
    }
}
