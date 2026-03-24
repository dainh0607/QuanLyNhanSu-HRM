using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestPurchaseDetailsConfiguration : IEntityTypeConfiguration<RequestPurchaseDetails>
    {
        public void Configure(EntityTypeBuilder<RequestPurchaseDetails> builder)
        {
            builder.ToTable("RequestPurchaseDetails");
            // Fluent API configurations go here
        }
    }
}
