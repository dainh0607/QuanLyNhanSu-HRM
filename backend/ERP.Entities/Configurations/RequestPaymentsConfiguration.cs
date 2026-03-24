using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestPaymentsConfiguration : IEntityTypeConfiguration<RequestPayments>
    {
        public void Configure(EntityTypeBuilder<RequestPayments> builder)
        {
            builder.ToTable("RequestPayments");
            // Fluent API configurations go here
        }
    }
}
