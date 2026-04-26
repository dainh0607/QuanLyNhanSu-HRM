using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class ShiftJobDepartmentsConfiguration : IEntityTypeConfiguration<ShiftJobDepartments>
    {
        public void Configure(EntityTypeBuilder<ShiftJobDepartments> builder)
        {
            builder.ToTable("ShiftJobDepartments");
            builder.HasKey(e => new { e.shift_job_id, e.department_id });
        }
    }
}
