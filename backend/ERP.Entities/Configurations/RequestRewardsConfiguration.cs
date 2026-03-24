using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestRewardsConfiguration : IEntityTypeConfiguration<RequestRewards>
    {
        public void Configure(EntityTypeBuilder<RequestRewards> builder)
        {
            builder.ToTable("RequestRewards");
            // Fluent API configurations go here
        }
    }
}
