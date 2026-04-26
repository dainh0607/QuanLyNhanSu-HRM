using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddShiftJobsTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
            IF OBJECT_ID('ShiftJobs', 'U') IS NULL
            BEGIN
                CREATE TABLE [ShiftJobs] (
                    [id] int NOT NULL IDENTITY(1, 1),
                    [tenant_id] int NULL,
                    [name] nvarchar(100) NOT NULL,
                    [code] nvarchar(50) NOT NULL,
                    [branch_id] int NOT NULL,
                    [color_code] nvarchar(20) NULL,
                    [is_active] bit NOT NULL,
                    [description] nvarchar(max) NULL,
                    [created_at] datetime2 NOT NULL,
                    [updated_at] datetime2 NULL,
                    CONSTRAINT [PK_ShiftJobs] PRIMARY KEY ([id]),
                    CONSTRAINT [FK_ShiftJobs_Branches_branch_id] FOREIGN KEY ([branch_id]) REFERENCES [Branches] ([id]) ON DELETE NO ACTION
                );
            END

            IF OBJECT_ID('ShiftJobDepartments', 'U') IS NULL
            BEGIN
                CREATE TABLE [ShiftJobDepartments] (
                    [shift_job_id] int NOT NULL,
                    [department_id] int NOT NULL,
                    [tenant_id] int NULL,
                    CONSTRAINT [PK_ShiftJobDepartments] PRIMARY KEY ([shift_job_id], [department_id]),
                    CONSTRAINT [FK_ShiftJobDepartments_Departments_department_id] FOREIGN KEY ([department_id]) REFERENCES [Departments] ([id]) ON DELETE NO ACTION,
                    CONSTRAINT [FK_ShiftJobDepartments_ShiftJobs_shift_job_id] FOREIGN KEY ([shift_job_id]) REFERENCES [ShiftJobs] ([id]) ON DELETE NO ACTION
                );
            END

            IF OBJECT_ID('ShiftJobEmployees', 'U') IS NULL
            BEGIN
                CREATE TABLE [ShiftJobEmployees] (
                    [shift_job_id] int NOT NULL,
                    [employee_id] int NOT NULL,
                    [tenant_id] int NULL,
                    CONSTRAINT [PK_ShiftJobEmployees] PRIMARY KEY ([shift_job_id], [employee_id]),
                    CONSTRAINT [FK_ShiftJobEmployees_Employees_employee_id] FOREIGN KEY ([employee_id]) REFERENCES [Employees] ([id]) ON DELETE NO ACTION,
                    CONSTRAINT [FK_ShiftJobEmployees_ShiftJobs_shift_job_id] FOREIGN KEY ([shift_job_id]) REFERENCES [ShiftJobs] ([id]) ON DELETE NO ACTION
                );
            END

            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ShiftJobDepartments_department_id' AND object_id = OBJECT_ID('ShiftJobDepartments'))
            BEGIN
                CREATE INDEX [IX_ShiftJobDepartments_department_id] ON [ShiftJobDepartments] ([department_id]);
            END

            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ShiftJobEmployees_employee_id' AND object_id = OBJECT_ID('ShiftJobEmployees'))
            BEGIN
                CREATE INDEX [IX_ShiftJobEmployees_employee_id] ON [ShiftJobEmployees] ([employee_id]);
            END

            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ShiftJobs_branch_id' AND object_id = OBJECT_ID('ShiftJobs'))
            BEGIN
                CREATE INDEX [IX_ShiftJobs_branch_id] ON [ShiftJobs] ([branch_id]);
            END

            IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name = 'IX_ShiftJobs_tenant_id_code' AND object_id = OBJECT_ID('ShiftJobs'))
            BEGIN
                CREATE UNIQUE INDEX [IX_ShiftJobs_tenant_id_code] ON [ShiftJobs] ([tenant_id], [code]) WHERE [tenant_id] IS NOT NULL;
            END
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShiftJobDepartments");

            migrationBuilder.DropTable(
                name: "ShiftJobEmployees");

            migrationBuilder.DropTable(
                name: "ShiftJobs");
        }
    }
}
