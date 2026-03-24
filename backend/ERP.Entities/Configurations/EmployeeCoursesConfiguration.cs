using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class EmployeeCoursesConfiguration : IEntityTypeConfiguration<EmployeeCourses>
    {
        public void Configure(EntityTypeBuilder<EmployeeCourses> builder)
        {
            builder.ToTable("EmployeeCourses");
            // Fluent API configurations go here
        }
    }
}
