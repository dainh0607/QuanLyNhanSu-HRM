using System;
using System.Collections.Generic;

namespace ERP.DTOs.Employees.Profile
{
    public class SalaryPackageDto
    {
        public BaseSalaryConfigDto BaseSalary { get; set; } = new();
        public List<VariableSalaryDto> VariableSalaries { get; set; } = new();
        public List<AllowanceItemDto> Allowances { get; set; } = new();
        public List<OtherIncomeItemDto> OtherIncomes { get; set; } = new();
    }

    public class BaseSalaryConfigDto
    {
        public string? PaymentMethod { get; set; }
        public int? SalaryGradeId { get; set; }
        public decimal? Amount { get; set; }
    }

    public class VariableSalaryDto
    {
        public int? Id { get; set; }
        public string? PaymentMethod { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int SalaryGradeId { get; set; }
        public decimal? Amount { get; set; } // Auto-filled from grade but can be returned for UI
        public string? Note { get; set; }
    }

    public class AllowanceItemDto
    {
        public int? Id { get; set; }
        public int AllowanceTypeId { get; set; }
        public string? AllowanceTypeName { get; set; }
        public decimal Amount { get; set; }
    }

    public class OtherIncomeItemDto
    {
        public int? Id { get; set; }
        public int IncomeTypeId { get; set; }
        public string? IncomeTypeName { get; set; }
        public decimal Amount { get; set; }
    }

    public class SalaryGradeDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Amount { get; set; }
    }

    public class SalaryGradeCreateDto
    {
        public string Name { get; set; }
        public decimal Amount { get; set; }
    }
}
