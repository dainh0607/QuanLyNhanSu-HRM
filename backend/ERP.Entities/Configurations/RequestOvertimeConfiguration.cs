using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestOvertimeConfiguration : IEntityTypeConfiguration<RequestOvertime>
    {
        public void Configure(EntityTypeBuilder<RequestOvertime> builder)
        {
            builder.ToTable("RequestOvertime");
            // Fluent API configurations go here
        }
    }
}
