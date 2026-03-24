using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestExpensePaymentsConfiguration : IEntityTypeConfiguration<RequestExpensePayments>
    {
        public void Configure(EntityTypeBuilder<RequestExpensePayments> builder)
        {
            builder.ToTable("RequestExpensePayments");
            // Fluent API configurations go here
        }
    }
}
