using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class DisciplineTypesConfiguration : IEntityTypeConfiguration<DisciplineTypes>
    {
        public void Configure(EntityTypeBuilder<DisciplineTypes> builder)
        {
            builder.ToTable("DisciplineTypes");
            // Fluent API configurations go here
        }
    }
}
