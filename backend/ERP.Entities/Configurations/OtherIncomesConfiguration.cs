using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class OtherIncomesConfiguration : IEntityTypeConfiguration<OtherIncomes>
    {
        public void Configure(EntityTypeBuilder<OtherIncomes> builder)
        {
            builder.ToTable("OtherIncomes");

            builder.HasOne(i => i.Salary)
                .WithMany(s => s.OtherIncomes)
                .HasForeignKey(i => i.salary_id)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
