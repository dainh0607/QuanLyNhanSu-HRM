using System;
using System.IO;
using System.Threading.Tasks;
using ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace ERP.API.DataTest
{
    public static class DataSeeder
    {
        public static async Task ApplySampleDataAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<AppDbContext>>();

            try
            {
                string sqlFilePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "DataTest", "sample_data.sql");
                
                // If not found in base directory (e.g. during development), try project directory
                if (!File.Exists(sqlFilePath))
                {
                    sqlFilePath = Path.Combine(Directory.GetCurrentDirectory(), "DataTest", "sample_data.sql");
                }

                if (!File.Exists(sqlFilePath))
                {
                    logger.LogWarning("Sample data SQL file not found at: {Path}", sqlFilePath);
                    return;
                }

                logger.LogInformation("Applying sample data from: {Path}", sqlFilePath);
                
                string sql = await File.ReadAllTextAsync(sqlFilePath);
                
                // Properly split by 'GO' on a line by itself
                var commands = System.Text.RegularExpressions.Regex.Split(
                    sql, 
                    @"^\s*GO\s*$", 
                    System.Text.RegularExpressions.RegexOptions.Multiline | System.Text.RegularExpressions.RegexOptions.IgnoreCase);

                foreach (var command in commands)
                {
                    if (string.IsNullOrWhiteSpace(command)) continue;
                    await context.Database.ExecuteSqlRawAsync(command);
                }

                logger.LogInformation("Sample data applied successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Error applying sample data.");
            }
        }
    }
}
