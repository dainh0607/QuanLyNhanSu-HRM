using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class TaxBracketsConfiguration : IEntityTypeConfiguration<TaxBrackets>
    {
        public void Configure(EntityTypeBuilder<TaxBrackets> builder)
        {
            builder.ToTable("TaxBrackets");
            // Fluent API configurations go here
        }
    }
}
