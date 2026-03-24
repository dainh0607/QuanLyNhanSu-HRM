using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class ContractTypesConfiguration : IEntityTypeConfiguration<ContractTypes>
    {
        public void Configure(EntityTypeBuilder<ContractTypes> builder)
        {
            builder.ToTable("ContractTypes");
            // Fluent API configurations go here
        }
    }
}
