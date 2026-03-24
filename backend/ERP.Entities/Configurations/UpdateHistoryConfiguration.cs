using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class UpdateHistoryConfiguration : IEntityTypeConfiguration<UpdateHistory>
    {
        public void Configure(EntityTypeBuilder<UpdateHistory> builder)
        {
            builder.ToTable("UpdateHistory");
            // Fluent API configurations go here
        }
    }
}
