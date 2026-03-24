using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class BankAccountsConfiguration : IEntityTypeConfiguration<BankAccounts>
    {
        public void Configure(EntityTypeBuilder<BankAccounts> builder)
        {
            builder.ToTable("BankAccounts");
            // Fluent API configurations go here
        }
    }
}
