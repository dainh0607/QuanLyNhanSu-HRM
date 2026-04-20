using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class UpdateInsuranceAndAddressSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "company_pays_health",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "company_pays_social",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "company_pays_unemployment",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "employee_pays_health",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "employee_pays_social",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "employee_pays_unemployment",
                table: "Insurances");

            migrationBuilder.AlterColumn<string>(
                name: "social_insurance_no",
                table: "Insurances",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "registration_place",
                table: "Insurances",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "position",
                table: "Insurances",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "note",
                table: "Insurances",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "medical_history",
                table: "Insurances",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "maternity_regime",
                table: "Insurances",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255);

            migrationBuilder.AlterColumn<string>(
                name: "health_insurance_no",
                table: "Insurances",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AddColumn<decimal>(
                name: "company_health_rate",
                table: "Insurances",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "company_social_rate",
                table: "Insurances",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "company_unemployment_rate",
                table: "Insurances",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Insurances",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<decimal>(
                name: "employee_health_rate",
                table: "Insurances",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "employee_social_rate",
                table: "Insurances",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "employee_unemployment_rate",
                table: "Insurances",
                type: "decimal(18,2)",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "is_book_submitted",
                table: "Insurances",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "Insurances",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "postal_code",
                table: "Addresses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20);

            migrationBuilder.AlterColumn<string>(
                name: "district",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "country",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AlterColumn<string>(
                name: "city",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100);

            migrationBuilder.AddColumn<int>(
                name: "country_id",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "district_id",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "province_id",
                table: "Addresses",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Insurances_birth_place_address_id",
                table: "Insurances",
                column: "birth_place_address_id");

            migrationBuilder.CreateIndex(
                name: "IX_Insurances_contact_address_id",
                table: "Insurances",
                column: "contact_address_id");

            migrationBuilder.CreateIndex(
                name: "IX_Insurances_residence_address_id",
                table: "Insurances",
                column: "residence_address_id");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_country_id",
                table: "Addresses",
                column: "country_id");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_district_id",
                table: "Addresses",
                column: "district_id");

            migrationBuilder.CreateIndex(
                name: "IX_Addresses_province_id",
                table: "Addresses",
                column: "province_id");

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Countries_country_id",
                table: "Addresses",
                column: "country_id",
                principalTable: "Countries",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Districts_district_id",
                table: "Addresses",
                column: "district_id",
                principalTable: "Districts",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Addresses_Provinces_province_id",
                table: "Addresses",
                column: "province_id",
                principalTable: "Provinces",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Insurances_Addresses_birth_place_address_id",
                table: "Insurances",
                column: "birth_place_address_id",
                principalTable: "Addresses",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Insurances_Addresses_contact_address_id",
                table: "Insurances",
                column: "contact_address_id",
                principalTable: "Addresses",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Insurances_Addresses_residence_address_id",
                table: "Insurances",
                column: "residence_address_id",
                principalTable: "Addresses",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Countries_country_id",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Districts_district_id",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Addresses_Provinces_province_id",
                table: "Addresses");

            migrationBuilder.DropForeignKey(
                name: "FK_Insurances_Addresses_birth_place_address_id",
                table: "Insurances");

            migrationBuilder.DropForeignKey(
                name: "FK_Insurances_Addresses_contact_address_id",
                table: "Insurances");

            migrationBuilder.DropForeignKey(
                name: "FK_Insurances_Addresses_residence_address_id",
                table: "Insurances");

            migrationBuilder.DropIndex(
                name: "IX_Insurances_birth_place_address_id",
                table: "Insurances");

            migrationBuilder.DropIndex(
                name: "IX_Insurances_contact_address_id",
                table: "Insurances");

            migrationBuilder.DropIndex(
                name: "IX_Insurances_residence_address_id",
                table: "Insurances");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_country_id",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_district_id",
                table: "Addresses");

            migrationBuilder.DropIndex(
                name: "IX_Addresses_province_id",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "company_health_rate",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "company_social_rate",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "company_unemployment_rate",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "employee_health_rate",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "employee_social_rate",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "employee_unemployment_rate",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "is_book_submitted",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "Insurances");

            migrationBuilder.DropColumn(
                name: "country_id",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "district_id",
                table: "Addresses");

            migrationBuilder.DropColumn(
                name: "province_id",
                table: "Addresses");

            migrationBuilder.AlterColumn<string>(
                name: "social_insurance_no",
                table: "Insurances",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "registration_place",
                table: "Insurances",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "position",
                table: "Insurances",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "note",
                table: "Insurances",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "medical_history",
                table: "Insurances",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "maternity_regime",
                table: "Insurances",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(255)",
                oldMaxLength: 255,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "health_insurance_no",
                table: "Insurances",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50,
                oldNullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "company_pays_health",
                table: "Insurances",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "company_pays_social",
                table: "Insurances",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "company_pays_unemployment",
                table: "Insurances",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "employee_pays_health",
                table: "Insurances",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "employee_pays_social",
                table: "Insurances",
                type: "bit",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "employee_pays_unemployment",
                table: "Insurances",
                type: "bit",
                nullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "postal_code",
                table: "Addresses",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(20)",
                oldMaxLength: 20,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "district",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "country",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "city",
                table: "Addresses",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(100)",
                oldMaxLength: 100,
                oldNullable: true);
        }
    }
}
