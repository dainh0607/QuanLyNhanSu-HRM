using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class OtherIncomesConfiguration : IEntityTypeConfiguration<OtherIncomes>
    {
        public void Configure(EntityTypeBuilder<OtherIncomes> builder)
        {
            builder.ToTable("OtherIncomes");
            // Fluent API configurations go here
        }
    }
}
