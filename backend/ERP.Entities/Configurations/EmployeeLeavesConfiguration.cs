using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class EmployeeLeavesConfiguration : IEntityTypeConfiguration<EmployeeLeaves>
    {
        public void Configure(EntityTypeBuilder<EmployeeLeaves> builder)
        {
            builder.ToTable("EmployeeLeaves");
            // Fluent API configurations go here
        }
    }
}
