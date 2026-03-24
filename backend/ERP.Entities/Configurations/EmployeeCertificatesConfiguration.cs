using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class EmployeeCertificatesConfiguration : IEntityTypeConfiguration<EmployeeCertificates>
    {
        public void Configure(EntityTypeBuilder<EmployeeCertificates> builder)
        {
            builder.ToTable("EmployeeCertificates");
            // Fluent API configurations go here
        }
    }
}
