using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestShiftChangeConfiguration : IEntityTypeConfiguration<RequestShiftChange>
    {
        public void Configure(EntityTypeBuilder<RequestShiftChange> builder)
        {
            builder.ToTable("RequestShiftChange");
            // Fluent API configurations go here
        }
    }
}
