using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestPurchasesConfiguration : IEntityTypeConfiguration<RequestPurchases>
    {
        public void Configure(EntityTypeBuilder<RequestPurchases> builder)
        {
            builder.ToTable("RequestPurchases");
            // Fluent API configurations go here
        }
    }
}
