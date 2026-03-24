using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestApprovalsConfiguration : IEntityTypeConfiguration<RequestApprovals>
    {
        public void Configure(EntityTypeBuilder<RequestApprovals> builder)
        {
            builder.ToTable("RequestApprovals");
            // Fluent API configurations go here
        }
    }
}
