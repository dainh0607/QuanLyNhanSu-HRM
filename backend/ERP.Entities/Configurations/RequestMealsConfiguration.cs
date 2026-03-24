using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class RequestMealsConfiguration : IEntityTypeConfiguration<RequestMeals>
    {
        public void Configure(EntityTypeBuilder<RequestMeals> builder)
        {
            builder.ToTable("RequestMeals");
            // Fluent API configurations go here
        }
    }
}
