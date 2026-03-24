using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestBorrowsConfiguration : IEntityTypeConfiguration<RequestBorrows>
    {
        public void Configure(EntityTypeBuilder<RequestBorrows> builder)
        {
            builder.ToTable("RequestBorrows");
            // Fluent API configurations go here
        }
    }
}
