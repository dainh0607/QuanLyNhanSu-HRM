using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RewardTypesConfiguration : IEntityTypeConfiguration<RewardTypes>
    {
        public void Configure(EntityTypeBuilder<RewardTypes> builder)
        {
            builder.ToTable("RewardTypes");
            // Fluent API configurations go here
        }
    }
}
