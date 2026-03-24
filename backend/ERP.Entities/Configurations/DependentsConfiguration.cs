using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class DependentsConfiguration : IEntityTypeConfiguration<Dependents>
    {
        public void Configure(EntityTypeBuilder<Dependents> builder)
        {
            builder.ToTable("Dependents");
            // Fluent API configurations go here
        }
    }
}
