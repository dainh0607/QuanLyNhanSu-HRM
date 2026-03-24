using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class EvaluationsConfiguration : IEntityTypeConfiguration<Evaluations>
    {
        public void Configure(EntityTypeBuilder<Evaluations> builder)
        {
            builder.ToTable("Evaluations");
            // Fluent API configurations go here
        }
    }
}
