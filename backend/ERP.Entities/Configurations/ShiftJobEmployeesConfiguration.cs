using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class ShiftJobEmployeesConfiguration : IEntityTypeConfiguration<ShiftJobEmployees>
    {
        public void Configure(EntityTypeBuilder<ShiftJobEmployees> builder)
        {
            builder.ToTable("ShiftJobEmployees");
            builder.HasKey(e => new { e.shift_job_id, e.employee_id });
        }
    }
}
