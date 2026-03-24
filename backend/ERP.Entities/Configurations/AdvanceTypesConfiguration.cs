using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class AdvanceTypesConfiguration : IEntityTypeConfiguration<AdvanceTypes>
    {
        public void Configure(EntityTypeBuilder<AdvanceTypes> builder)
        {
            builder.ToTable("AdvanceTypes");
            // Fluent API configurations go here
        }
    }
}
