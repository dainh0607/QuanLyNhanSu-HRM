using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestReimbursementDetailsConfiguration : IEntityTypeConfiguration<RequestReimbursementDetails>
    {
        public void Configure(EntityTypeBuilder<RequestReimbursementDetails> builder)
        {
            builder.ToTable("RequestReimbursementDetails");
            // Fluent API configurations go here
        }
    }
}
