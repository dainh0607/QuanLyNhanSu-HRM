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
            // Fluent API configurations go here
        }
    }
}
