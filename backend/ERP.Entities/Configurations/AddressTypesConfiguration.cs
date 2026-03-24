using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class AddressTypesConfiguration : IEntityTypeConfiguration<AddressTypes>
    {
        public void Configure(EntityTypeBuilder<AddressTypes> builder)
        {
            builder.ToTable("AddressTypes");
            // Fluent API configurations go here
        }
    }
}
