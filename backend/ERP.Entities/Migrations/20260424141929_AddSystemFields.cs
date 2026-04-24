using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace ERP.Entities.Migrations
{
    /// <inheritdoc />
    public partial class AddSystemFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemFields",
                columns: table => new
                {
                    id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    category = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    field_name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    field_type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    display_order = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemFields", x => x.id);
                });

            migrationBuilder.InsertData(
                table: "SystemFields",
                columns: new[] { "id", "category", "display_order", "field_name", "field_type" },
                values: new object[,]
                {
                    { 1, "Thông tin cơ bản", 1, "Họ và tên", "Văn bản" },
                    { 2, "Thông tin cơ bản", 2, "Ngày sinh", "Ngày" },
                    { 3, "Thông tin cơ bản", 3, "Giới tính", "Văn bản" },
                    { 4, "Thông tin cơ bản", 4, "Mã nhân viên", "Văn bản" },
                    { 5, "Thông tin liên hệ", 1, "Email", "Email" },
                    { 6, "Thông tin liên hệ", 2, "Điện thoại", "Văn bản" },
                    { 7, "Thông tin liên hệ", 3, "Địa chỉ", "Văn bản" },
                    { 8, "Thông tin liên hệ", 4, "Mạng xã hội", "Văn bản" },
                    { 9, "Liên hệ khẩn cấp", 1, "Điện thoại di động", "Văn bản" },
                    { 10, "Liên hệ khẩn cấp", 2, "Quan hệ với nhân viên", "Văn bản" },
                    { 11, "Liên hệ khẩn cấp", 3, "Điện thoại cố định", "Văn bản" },
                    { 12, "Liên hệ khẩn cấp", 4, "Địa chỉ khẩn cấp", "Văn bản" },
                    { 13, "Địa chỉ thường trú", 1, "Quốc gia", "Văn bản" },
                    { 14, "Địa chỉ thường trú", 2, "Địa chỉ thường trú", "Văn bản" },
                    { 15, "Địa chỉ thường trú", 3, "Nguyên quán", "Văn bản" },
                    { 16, "Trình độ học vấn", 1, "Trường đại học/Học viện", "Văn bản" },
                    { 17, "Trình độ học vấn", 2, "Chuyên ngành", "Văn bản" },
                    { 18, "Trình độ học vấn", 3, "Trình độ", "Văn bản" },
                    { 19, "Trình độ học vấn", 4, "Ngày cấp", "Ngày" },
                    { 20, "Trình độ học vấn", 5, "Ghi chú", "Văn bản" },
                    { 21, "Thông tin định danh", 1, "Loại định danh", "Văn bản" },
                    { 22, "Thông tin định danh", 2, "CMND/CCCD", "Văn bản" },
                    { 23, "Thông tin định danh", 3, "Ngày cấp", "Ngày" },
                    { 24, "Thông tin định danh", 4, "Nơi cấp", "Văn bản" },
                    { 25, "Thông tin định danh", 5, "Số hộ chiếu", "Văn bản" },
                    { 26, "Thông tin định danh", 6, "Ngày cấp hộ chiếu", "Ngày" },
                    { 27, "Thông tin định danh", 7, "Ngày hết hạn hộ chiếu", "Ngày" },
                    { 28, "Thông tin định danh", 8, "Nơi cấp hộ chiếu", "Văn bản" },
                    { 29, "Sức khỏe", 1, "Chiều cao", "Văn bản" },
                    { 30, "Sức khỏe", 2, "Cân nặng", "Văn bản" },
                    { 31, "Sức khỏe", 3, "Nhóm máu", "Văn bản" },
                    { 32, "Sức khỏe", 4, "Tình trạng sức khỏe", "Văn bản" },
                    { 33, "Sức khỏe", 5, "Bệnh bẩm sinh, mãn tính (nếu có)", "Văn bản" },
                    { 34, "Sức khỏe", 6, "Ngày kiểm tra gần nhất", "Ngày" },
                    { 35, "Chữ ký số", 1, "Chữ ký điện tử", "Văn bản" },
                    { 36, "Chữ ký số", 2, "Mã QR cá nhân", "Văn bản" },
                    { 37, "Thông tin khác", 1, "Công đoàn", "Văn bản" },
                    { 38, "Thông tin khác", 2, "Dân tộc", "Văn bản" },
                    { 39, "Thông tin khác", 3, "Tôn giáo", "Văn bản" },
                    { 40, "Thông tin khác", 4, "Mã số thuế", "Văn bản" },
                    { 41, "Thông tin khác", 5, "Tình trạng hôn nhân", "Văn bản" },
                    { 42, "Thông tin khác", 6, "Ghi chú", "Văn bản" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "SystemFields");
        }
    }
}
