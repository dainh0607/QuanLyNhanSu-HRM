using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddTenantSettingsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Id",
                table: "Wards",
                newName: "id");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[SalaryGrades]') 
                    AND name = N'payment_type'
                )
                BEGIN
                    ALTER TABLE [SalaryGrades] ADD [payment_type] nvarchar(20) NOT NULL DEFAULT N'';
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[PayrollTypes]') 
                    AND name = N'formula'
                )
                BEGIN
                    ALTER TABLE [PayrollTypes] ADD [formula] nvarchar(max) NOT NULL DEFAULT N'';
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[PayrollDetails]') 
                    AND name = N'component_code'
                )
                BEGIN
                    ALTER TABLE [PayrollDetails] ADD [component_code] nvarchar(50) NOT NULL DEFAULT N'';
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[PayrollDetails]') 
                    AND name = N'display_order'
                )
                BEGIN
                    ALTER TABLE [PayrollDetails] ADD [display_order] int NOT NULL DEFAULT 0;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[IncomeTypes]') 
                    AND name = N'display_order'
                )
                BEGIN
                    ALTER TABLE [IncomeTypes] ADD [display_order] int NOT NULL DEFAULT 0;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[IncomeTypes]') 
                    AND name = N'keyword'
                )
                BEGIN
                    ALTER TABLE [IncomeTypes] ADD [keyword] nvarchar(100) NULL;
                END
            ");

            migrationBuilder.AlterColumn<string>(
                name: "home_phone",
                table: "Employees",
                type: "nvarchar(10)",
                maxLength: 10,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[AllowanceTypes]') 
                    AND name = N'display_order'
                )
                BEGIN
                    ALTER TABLE [AllowanceTypes] ADD [display_order] int NOT NULL DEFAULT 0;
                END
            ");

            migrationBuilder.Sql(@"
                IF NOT EXISTS (
                    SELECT * FROM sys.columns 
                    WHERE object_id = OBJECT_ID(N'[AllowanceTypes]') 
                    AND name = N'keyword'
                )
                BEGIN
                    ALTER TABLE [AllowanceTypes] ADD [keyword] nvarchar(100) NULL;
                END
            ");

            migrationBuilder.Sql(@"
                IF OBJECT_ID(N'[PayrollAdvanceTypes]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [PayrollAdvanceTypes] (
                        [id] int NOT NULL IDENTITY,
                        [tenant_id] int NULL,
                        [name] nvarchar(100) NOT NULL,
                        [keyword] nvarchar(100) NULL,
                        [display_order] int NOT NULL,
                        [is_active] bit NOT NULL,
                        [created_at] datetime2 NOT NULL,
                        [updated_at] datetime2 NULL,
                        CONSTRAINT [PK_PayrollAdvanceTypes] PRIMARY KEY ([id])
                    );
                END
            ");

            migrationBuilder.Sql(@"
                IF OBJECT_ID(N'[TenantSettings]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [TenantSettings] (
                        [tenant_id] int NOT NULL,
                        [auto_schedule_next_week] bit NOT NULL,
                        [allow_shift_registration] bit NOT NULL,
                        [enable_registration_lock] bit NOT NULL,
                        [registration_lock_day] nvarchar(20) NOT NULL,
                        [advance_schedule_weeks] int NOT NULL,
                        [require_shift_publish] bit NOT NULL,
                        [id] int NOT NULL,
                        [created_at] datetime2 NOT NULL,
                        [updated_at] datetime2 NULL,
                        CONSTRAINT [PK_TenantSettings] PRIMARY KEY ([tenant_id]),
                        CONSTRAINT [FK_TenantSettings_Tenants_tenant_id] FOREIGN KEY ([tenant_id]) REFERENCES [Tenants] ([id]) ON DELETE NO ACTION
                    );
                END
            ");

            migrationBuilder.UpdateData(
                table: "AllowanceTypes",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "display_order", "keyword" },
                values: new object[] { 0, null });

            migrationBuilder.UpdateData(
                table: "AllowanceTypes",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "display_order", "keyword" },
                values: new object[] { 0, null });

            migrationBuilder.UpdateData(
                table: "AllowanceTypes",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "display_order", "keyword" },
                values: new object[] { 0, null });

            migrationBuilder.UpdateData(
                table: "IncomeTypes",
                keyColumn: "id",
                keyValue: 1,
                columns: new[] { "display_order", "keyword" },
                values: new object[] { 0, null });

            migrationBuilder.UpdateData(
                table: "IncomeTypes",
                keyColumn: "id",
                keyValue: 2,
                columns: new[] { "display_order", "keyword" },
                values: new object[] { 0, null });

            migrationBuilder.UpdateData(
                table: "IncomeTypes",
                keyColumn: "id",
                keyValue: 3,
                columns: new[] { "display_order", "keyword" },
                values: new object[] { 0, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PayrollAdvanceTypes");

            migrationBuilder.DropTable(
                name: "TenantSettings");

            migrationBuilder.DropColumn(
                name: "payment_type",
                table: "SalaryGrades");

            migrationBuilder.DropColumn(
                name: "formula",
                table: "PayrollTypes");

            migrationBuilder.DropColumn(
                name: "component_code",
                table: "PayrollDetails");

            migrationBuilder.DropColumn(
                name: "display_order",
                table: "PayrollDetails");

            migrationBuilder.DropColumn(
                name: "display_order",
                table: "IncomeTypes");

            migrationBuilder.DropColumn(
                name: "keyword",
                table: "IncomeTypes");

            migrationBuilder.DropColumn(
                name: "display_order",
                table: "AllowanceTypes");

            migrationBuilder.DropColumn(
                name: "keyword",
                table: "AllowanceTypes");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "Wards",
                newName: "Id");

            migrationBuilder.AlterColumn<string>(
                name: "home_phone",
                table: "Employees",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(10)",
                oldMaxLength: 10,
                oldNullable: true);
        }
    }
}
