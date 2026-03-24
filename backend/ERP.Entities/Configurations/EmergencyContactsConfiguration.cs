using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ERP.Entities.Models;

namespace ERP.Entities.Configurations
{
    public class EmergencyContactsConfiguration : IEntityTypeConfiguration<EmergencyContacts>
    {
        public void Configure(EntityTypeBuilder<EmergencyContacts> builder)
        {
            builder.ToTable("EmergencyContacts");
            // Fluent API configurations go here
        }
    }
}
