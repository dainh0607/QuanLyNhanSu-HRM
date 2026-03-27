using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class PayrollsConfiguration : IEntityTypeConfiguration<Payrolls>
    {
        public void Configure(EntityTypeBuilder<Payrolls> builder)
        {
            builder.ToTable("Payrolls");

            builder.HasOne(p => p.Period)
                .WithMany(pp => pp.Payrolls)
                .HasForeignKey(p => p.period_id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
