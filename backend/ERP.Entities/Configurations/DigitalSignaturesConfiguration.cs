using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class DigitalSignaturesConfiguration : IEntityTypeConfiguration<DigitalSignatures>
    {
        public void Configure(EntityTypeBuilder<DigitalSignatures> builder)
        {
            builder.ToTable("DigitalSignatures");
            // Fluent API configurations go here
        }
    }
}
