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
                    
                    // Simple regex to find table name in INSERT statement
                    var match = System.Text.RegularExpressions.Regex.Match(command, @"INSERT\s+INTO\s+([\[\]\w\d_]+)", System.Text.RegularExpressions.RegexOptions.IgnoreCase);
                    
                    if (match.Success)
                    {
                        string tableName = match.Groups[1].Value.Trim('[', ']');
                        try 
                        {
                            // Wrap with IDENTITY_INSERT. This must be in the same batch/connection for some SQL providers.
                            // We use a single string to execute as one batch.
                            await context.Database.ExecuteSqlRawAsync("SET IDENTITY_INSERT [" + tableName + "] ON; " + command + "; SET IDENTITY_INSERT [" + tableName + "] OFF;");
                        }
                        catch (Exception)
                        {
                            // If SET IDENTITY_INSERT fails (e.g. table has no identity column), fall back to normal execution
                            await context.Database.ExecuteSqlRawAsync(command);
                        }
                    }
                    else
                    {
                        await context.Database.ExecuteSqlRawAsync(command);
                    }
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
