using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class SalaryGradeConfigConfiguration : IEntityTypeConfiguration<SalaryGradeConfig>
    {
        public void Configure(EntityTypeBuilder<SalaryGradeConfig> builder)
        {
            builder.ToTable("SalaryGradeConfig");
            // Fluent API configurations go here
        }
    }
}
