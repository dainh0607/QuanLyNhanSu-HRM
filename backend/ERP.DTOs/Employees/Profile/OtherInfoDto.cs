using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Employees.Profile
{
    /// <summary>
    /// DTO cho cụm "Thông tin khác" của nhân viên.
    /// Dùng cho cả GET (response) và PUT (request body).
    /// </summary>
    public class OtherInfoDto
    {
        /// <summary>Tên tổ chức công đoàn mà nhân viên tham gia.</summary>
        public string? UnionGroup { get; set; }

        /// <summary>Dân tộc của nhân viên (free-text, có thể nâng cấp lên dropdown sau).</summary>
        public string? Ethnicity { get; set; }

        /// <summary>Tôn giáo của nhân viên (free-text, có thể nâng cấp lên dropdown sau).</summary>
        public string? Religion { get; set; }

        /// <summary>
        /// Mã số thuế cá nhân. Chỉ được phép chứa ký tự số,
        /// độ dài hợp lệ là 10 hoặc 13 chữ số (theo chuẩn MST Việt Nam).
        /// </summary>
        [RegularExpression(@"^\d{10}(\d{3})?$",
            ErrorMessage = "Mã số thuế phải là số và có độ dài 10 hoặc 13 chữ số.")]
        public string? TaxCode { get; set; }

        /// <summary>
        /// Mã tình trạng hôn nhân. Giá trị hợp lệ: "SINGLE" (Độc thân) hoặc "MARRIED" (Đã kết hôn).
        /// Mặc định "SINGLE" khi chưa có dữ liệu.
        /// </summary>
        public string MaritalStatusCode { get; set; } = "SINGLE";

        /// <summary>Ghi chú thêm về nhân viên (textarea nhiều dòng).</summary>
        public string? Note { get; set; }
    }
}
