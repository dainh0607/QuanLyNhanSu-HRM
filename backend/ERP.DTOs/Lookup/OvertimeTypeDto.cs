namespace ERP.DTOs.Lookup
{
    public class OvertimeTypeDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = null!;
        public string Keyword { get; set; } = null!;
        public decimal RatePercentage { get; set; }
        public decimal? MonthlyLimitHours { get; set; }
        public decimal? YearlyLimitHours { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; }
        public int? DisplayOrder { get; set; }
    }

    public class OvertimeTypeCreateUpdateDto
    {
        public string Name { get; set; } = null!;
        public string Keyword { get; set; } = null!;
        public decimal RatePercentage { get; set; }
        public decimal? MonthlyLimitHours { get; set; }
        public decimal? YearlyLimitHours { get; set; }
        public string? Notes { get; set; }
        public bool IsActive { get; set; } = true;
        public int? DisplayOrder { get; set; }
    }
}
