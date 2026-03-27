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

            builder.HasOne(d => d.RequestPurchase)
                .WithMany(p => p.Details)
                .HasForeignKey(d => d.purchase_id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
