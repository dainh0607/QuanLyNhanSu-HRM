using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class TaxTypesConfiguration : IEntityTypeConfiguration<TaxTypes>
    {
        public void Configure(EntityTypeBuilder<TaxTypes> builder)
        {
            builder.ToTable("TaxTypes");
            // Fluent API configurations go here
        }
    }
}
