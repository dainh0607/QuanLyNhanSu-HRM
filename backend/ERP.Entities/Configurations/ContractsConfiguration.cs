using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class ContractsConfiguration : IEntityTypeConfiguration<Contracts>
    {
        public void Configure(EntityTypeBuilder<Contracts> builder)
        {
            builder.ToTable("Contracts");
            // Fluent API configurations go here
        }
    }
}
