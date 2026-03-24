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
            // Fluent API configurations go here
        }
    }
}
