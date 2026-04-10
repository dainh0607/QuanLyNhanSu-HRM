using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ERP.DTOs.Attendance
{
    public class OpenShiftCreateDto
    {
        [Required(ErrorMessage = "Ngày là bắt buộc")]
        public DateTime Date { get; set; }

        [Required(ErrorMessage = "ID Ca làm việc là bắt buộc")]
        public int ShiftId { get; set; }

        public List<int> BranchIds { get; set; } = new();
        public List<int> DepartmentIds { get; set; } = new();
        public List<int> PositionIds { get; set; } = new();

        [Range(1, 1000, ErrorMessage = "Số lượng phải từ 1 đến 1000")]
        public int Quantity { get; set; } = 1;

        public bool IsAutoPublish { get; set; } = true;

        public string? Note { get; set; }
    }
}
