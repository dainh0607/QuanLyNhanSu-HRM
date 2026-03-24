using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestShiftRegisterConfiguration : IEntityTypeConfiguration<RequestShiftRegister>
    {
        public void Configure(EntityTypeBuilder<RequestShiftRegister> builder)
        {
            builder.ToTable("RequestShiftRegister");
            // Fluent API configurations go here
        }
    }
}
