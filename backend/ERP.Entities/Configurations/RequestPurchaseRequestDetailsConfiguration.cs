using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestPurchaseRequestDetailsConfiguration : IEntityTypeConfiguration<RequestPurchaseRequestDetails>
    {
        public void Configure(EntityTypeBuilder<RequestPurchaseRequestDetails> builder)
        {
            builder.ToTable("RequestPurchaseRequestDetails");
            // Fluent API configurations go here
        }
    }
}
