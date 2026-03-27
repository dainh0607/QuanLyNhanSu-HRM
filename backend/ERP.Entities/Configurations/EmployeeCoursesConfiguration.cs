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
            builder.HasKey(e => new { e.employee_id, e.course_id });
        }
    }
}
