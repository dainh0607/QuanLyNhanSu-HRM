using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestReimbursementsConfiguration : IEntityTypeConfiguration<RequestReimbursements>
    {
        public void Configure(EntityTypeBuilder<RequestReimbursements> builder)
        {
            builder.ToTable("RequestReimbursements");
            // Fluent API configurations go here
        }
    }
}
