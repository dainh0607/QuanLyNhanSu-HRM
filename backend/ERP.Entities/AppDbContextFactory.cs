using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;
using System.IO;
using ERP.Entities.Interfaces;
using System.Collections.Generic;
using System.Linq;

namespace ERP.Entities
{
    public class AppDbContextFactory : IDesignTimeDbContextFactory<AppDbContext>
    {
        public AppDbContext CreateDbContext(string[] args)
        {
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Path.Combine(Directory.GetCurrentDirectory(), "../ERP.API"))
                .AddJsonFile("appsettings.json")
                .Build();

            var optionsBuilder = new DbContextOptionsBuilder<AppDbContext>();
            var connectionString = configuration.GetConnectionString("DefaultConnection");

            optionsBuilder.UseSqlServer(connectionString);
            
            return new AppDbContext(optionsBuilder.Options, new DesignTimeUserContext());
        }

        private class DesignTimeUserContext : ICurrentUserContext
        {
            public int? UserId => null;
            public int? TenantId => null;
            public bool IsAuthenticated => false;
            public bool IsSystemAdmin => false;
            public bool IsBreakGlassSession => false;
            public IEnumerable<string> Roles => Enumerable.Empty<string>();
            public IEnumerable<int> AllowedRegionIds => Enumerable.Empty<int>();
            public IEnumerable<int> AllowedBranchIds => Enumerable.Empty<int>();
            public IEnumerable<int> AllowedDepartmentIds => Enumerable.Empty<int>();
            public bool IsInRole(string roleName) => false;
        }
    }
}