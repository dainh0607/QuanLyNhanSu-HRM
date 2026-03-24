using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class PromotionHistoryConfiguration : IEntityTypeConfiguration<PromotionHistory>
    {
        public void Configure(EntityTypeBuilder<PromotionHistory> builder)
        {
            builder.ToTable("PromotionHistory");
            // Fluent API configurations go here
        }
    }
}
