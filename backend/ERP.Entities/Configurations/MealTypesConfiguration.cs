using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class MealTypesConfiguration : IEntityTypeConfiguration<MealTypes>
    {
        public void Configure(EntityTypeBuilder<MealTypes> builder)
        {
            builder.ToTable("MealTypes");
            // Fluent API configurations go here
        }
    }
}
