using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class PayrollDetailsConfiguration : IEntityTypeConfiguration<PayrollDetails>
    {
        public void Configure(EntityTypeBuilder<PayrollDetails> builder)
        {
            builder.ToTable("PayrollDetails");
            // Fluent API configurations go here
        }
    }
}
