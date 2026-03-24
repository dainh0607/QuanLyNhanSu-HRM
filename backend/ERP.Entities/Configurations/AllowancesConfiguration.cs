using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class AllowancesConfiguration : IEntityTypeConfiguration<Allowances>
    {
        public void Configure(EntityTypeBuilder<Allowances> builder)
        {
            builder.ToTable("Allowances");
            // Fluent API configurations go here
        }
    }
}
