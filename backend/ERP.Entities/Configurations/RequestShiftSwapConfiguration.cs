using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestShiftSwapConfiguration : IEntityTypeConfiguration<RequestShiftSwap>
    {
        public void Configure(EntityTypeBuilder<RequestShiftSwap> builder)
        {
            builder.ToTable("RequestShiftSwap");
            // Fluent API configurations go here
        }
    }
}
