using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestPurchaseRequestsConfiguration : IEntityTypeConfiguration<RequestPurchaseRequests>
    {
        public void Configure(EntityTypeBuilder<RequestPurchaseRequests> builder)
        {
            builder.ToTable("RequestPurchaseRequests");
            // Fluent API configurations go here
        }
    }
}
