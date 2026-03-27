using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class AllowancesConfiguration : IEntityTypeConfiguration<Allowances>
    {
        public void Configure(EntityTypeBuilder<Allowances> builder)
        {
            builder.ToTable("Allowances");

            builder.HasOne(a => a.Salary)
                .WithMany(s => s.Allowances)
                .HasForeignKey(a => a.salary_id)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
