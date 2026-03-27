using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestBorrowDetailsConfiguration : IEntityTypeConfiguration<RequestBorrowDetails>
    {
        public void Configure(EntityTypeBuilder<RequestBorrowDetails> builder)
        {
            builder.ToTable("RequestBorrowDetails");

            builder.HasOne(d => d.RequestBorrow)
                .WithMany(b => b.Details)
                .HasForeignKey(d => d.borrow_id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
