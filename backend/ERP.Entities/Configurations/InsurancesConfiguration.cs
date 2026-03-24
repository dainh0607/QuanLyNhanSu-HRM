using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class InsurancesConfiguration : IEntityTypeConfiguration<Insurances>
    {
        public void Configure(EntityTypeBuilder<Insurances> builder)
        {
            builder.ToTable("Insurances");
            // Fluent API configurations go here
        }
    }
}
