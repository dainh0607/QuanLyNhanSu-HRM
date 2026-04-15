using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddShiftAssignmentStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "status",
                table: "ShiftAssignments",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "draft");

            // Cập nhật giá trị status cho dữ liệu cũ
            migrationBuilder.Sql("UPDATE ShiftAssignments SET status = 'approved' WHERE is_published = 1");
            migrationBuilder.Sql("UPDATE ShiftAssignments SET status = 'draft' WHERE is_published = 0");


        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "status",
                table: "ShiftAssignments");


        }
    }
}
