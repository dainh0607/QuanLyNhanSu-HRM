using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class PayrollDeductionsConfiguration : IEntityTypeConfiguration<PayrollDeductions>
    {
        public void Configure(EntityTypeBuilder<PayrollDeductions> builder)
        {
            builder.ToTable("PayrollDeductions");
            // Fluent API configurations go here
        }
    }
}
