using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestDisciplinesConfiguration : IEntityTypeConfiguration<RequestDisciplines>
    {
        public void Configure(EntityTypeBuilder<RequestDisciplines> builder)
        {
            builder.ToTable("RequestDisciplines");
            // Fluent API configurations go here
        }
    }
}
