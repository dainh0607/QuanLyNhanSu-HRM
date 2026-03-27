using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class EmployeeEvaluationsConfiguration : IEntityTypeConfiguration<EmployeeEvaluations>
    {
        public void Configure(EntityTypeBuilder<EmployeeEvaluations> builder)
        {
            builder.ToTable("EmployeeEvaluations");
            builder.HasKey(e => new { e.employee_id, e.evaluation_id });
        }
    }
}
