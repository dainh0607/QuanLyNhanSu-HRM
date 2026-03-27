using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class EmployeeAddressesConfiguration : IEntityTypeConfiguration<EmployeeAddresses>
    {
        public void Configure(EntityTypeBuilder<EmployeeAddresses> builder)
        {
            builder.ToTable("EmployeeAddresses");
            builder.HasKey(e => new { e.employee_id, e.address_id });
        }
    }
}
