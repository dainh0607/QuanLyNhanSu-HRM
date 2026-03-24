using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class EmployeeSkillsConfiguration : IEntityTypeConfiguration<EmployeeSkills>
    {
        public void Configure(EntityTypeBuilder<EmployeeSkills> builder)
        {
            builder.ToTable("EmployeeSkills");
            // Fluent API configurations go here
        }
    }
}
