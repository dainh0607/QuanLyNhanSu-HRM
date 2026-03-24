using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class DecisionTypesConfiguration : IEntityTypeConfiguration<DecisionTypes>
    {
        public void Configure(EntityTypeBuilder<DecisionTypes> builder)
        {
            builder.ToTable("DecisionTypes");
            // Fluent API configurations go here
        }
    }
}
