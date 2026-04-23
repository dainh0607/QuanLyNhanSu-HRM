using System;
using System.Collections.Generic;

namespace ERP.DTOs.Payroll
{
    public class PayrollTableDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Departments { get; set; }
        public string Positions { get; set; }
        public int EmployeeCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public string Status { get; set; }
        public int Month { get; set; }
        public int Year { get; set; }
    }

    public class PayrollGroupDto
    {
        public string MonthYear { get; set; }
        public List<PayrollTableDto> Items { get; set; }
    }

    public class PayrollPagedResponseDto
    {
        public int Total { get; set; }
        public List<PayrollGroupDto> Data { get; set; }
    }
}
