using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditFieldsToDevices : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "note",
                table: "OpenShifts",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "department_id",
                table: "InvitationTokens",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "full_name",
                table: "InvitationTokens",
                type: "nvarchar(255)",
                maxLength: 255,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "job_title_id",
                table: "InvitationTokens",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "created_at",
                table: "Devices",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "updated_at",
                table: "Devices",
                type: "datetime2",
                nullable: true);


            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "name",
                value: "Nghị phép năm");

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "name",
                value: "Nghị ốm");

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "name",
                value: "Nghị không lương");

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "name",
                value: "Nghị thai sản");

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 5,
                column: "name",
                value: "Nghị hiếu hỷ");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_department_id",
                table: "InvitationTokens",
                column: "department_id");

            migrationBuilder.CreateIndex(
                name: "IX_InvitationTokens_job_title_id",
                table: "InvitationTokens",
                column: "job_title_id");


            migrationBuilder.AddForeignKey(
                name: "FK_InvitationTokens_Departments_department_id",
                table: "InvitationTokens",
                column: "department_id",
                principalTable: "Departments",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_InvitationTokens_JobTitles_job_title_id",
                table: "InvitationTokens",
                column: "job_title_id",
                principalTable: "JobTitles",
                principalColumn: "id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_InvitationTokens_Departments_department_id",
                table: "InvitationTokens");

            migrationBuilder.DropForeignKey(
                name: "FK_InvitationTokens_JobTitles_job_title_id",
                table: "InvitationTokens");


            migrationBuilder.DropIndex(
                name: "IX_InvitationTokens_department_id",
                table: "InvitationTokens");

            migrationBuilder.DropIndex(
                name: "IX_InvitationTokens_job_title_id",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "department_id",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "full_name",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "job_title_id",
                table: "InvitationTokens");

            migrationBuilder.DropColumn(
                name: "created_at",
                table: "Devices");

            migrationBuilder.DropColumn(
                name: "updated_at",
                table: "Devices");

            migrationBuilder.AlterColumn<string>(
                name: "note",
                table: "OpenShifts",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 1,
                column: "name",
                value: "Nghỉ phép năm");

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 2,
                column: "name",
                value: "Nghỉ ốm");

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 3,
                column: "name",
                value: "Nghỉ không lương");

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 4,
                column: "name",
                value: "Nghỉ thai sản");

            migrationBuilder.UpdateData(
                table: "LeaveTypes",
                keyColumn: "id",
                keyValue: 5,
                column: "name",
                value: "Nghỉ hiếu hỉ");
        }
    }
}
