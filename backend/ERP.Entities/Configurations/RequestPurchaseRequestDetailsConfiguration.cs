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

            builder.HasOne(d => d.RequestPurchaseRequest)
                .WithMany(r => r.Details)
                .HasForeignKey(d => d.purchase_request_id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
