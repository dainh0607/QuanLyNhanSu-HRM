using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class JobTitlesConfiguration : IEntityTypeConfiguration<JobTitles>
    {
        public void Configure(EntityTypeBuilder<JobTitles> builder)
        {
            builder.ToTable("JobTitles");
            // Fluent API configurations go here
        }
    }
}
