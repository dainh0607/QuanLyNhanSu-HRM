using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class EmployeesConfiguration : IEntityTypeConfiguration<Employees>
    {
        public void Configure(EntityTypeBuilder<Employees> builder)
        {
            builder.ToTable("Employees");

            builder.HasOne(e => e.Branch)
                .WithMany(b => b.Employees)
                .HasForeignKey(e => e.branch_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Department)
                .WithMany(d => d.Employees)
                .HasForeignKey(e => e.department_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.JobTitle)
                .WithMany(j => j.Employees)
                .HasForeignKey(e => e.job_title_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Region)
                .WithMany(r => r.Employees)
                .HasForeignKey(e => e.region_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Manager)
                .WithMany(m => m.Subordinates)
                .HasForeignKey(e => e.manager_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasMany(e => e.Subordinates)
                .WithOne(s => s.Manager)
                .HasForeignKey(s => s.manager_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.SecondaryBranch)
                .WithMany(b => b.SecondaryEmployees)
                .HasForeignKey(e => e.secondary_branch_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.SecondaryDepartment)
                .WithMany(d => d.SecondaryEmployees)
                .HasForeignKey(e => e.secondary_department_id)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.Gender)
                .WithMany()
                .HasForeignKey(e => e.gender_code)
                .HasPrincipalKey(g => g.code)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(e => e.MaritalStatus)
                .WithMany()
                .HasForeignKey(e => e.marital_status_code)
                .HasPrincipalKey(m => m.code)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
