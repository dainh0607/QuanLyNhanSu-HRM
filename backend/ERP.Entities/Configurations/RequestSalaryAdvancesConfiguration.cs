using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestSalaryAdvancesConfiguration : IEntityTypeConfiguration<RequestSalaryAdvances>
    {
        public void Configure(EntityTypeBuilder<RequestSalaryAdvances> builder)
        {
            builder.ToTable("RequestSalaryAdvances");
            // Fluent API configurations go here
        }
    }
}
