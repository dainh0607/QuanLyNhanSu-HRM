using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class DeductionsConfiguration : IEntityTypeConfiguration<Deductions>
    {
        public void Configure(EntityTypeBuilder<Deductions> builder)
        {
            builder.ToTable("Deductions");
            // Fluent API configurations go here
        }
    }
}
