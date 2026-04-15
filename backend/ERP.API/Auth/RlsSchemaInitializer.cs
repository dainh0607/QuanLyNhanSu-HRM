using ERP.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace ERP.API.Auth
{
    /// <summary>
    /// Automatically applies RLS SQL scripts to the database at startup.
    /// Ensures all developers have the latest security policies without manual execution.
    /// </summary>
    public static class RlsSchemaInitializer
    {
        public static async Task EnsureUpdatedAsync(AppDbContext context, string contentRootPath, ILogger logger)
        {
            try
            {
                // Check multiple possible locations for scripts
                // 1. Child of ContentRoot (for some environments)
                // 2. Sibling of ContentRoot (standard for project structure where API is subfolder)
                var possiblePaths = new[]
                {
                    Path.Combine(contentRootPath, "Scripts", "Database"),
                    Path.Combine(Directory.GetParent(contentRootPath)?.FullName ?? "", "Scripts", "Database"),
                    Path.Combine(Directory.GetParent(contentRootPath)?.Parent?.FullName ?? "", "Scripts", "Database")
                };

                string scriptsPath = null;
                foreach (var path in possiblePaths)
                {
                    if (Directory.Exists(path))
                    {
                        scriptsPath = path;
                        break;
                    }
                }

                if (string.IsNullOrEmpty(scriptsPath))
                {
                    logger.LogWarning("[RLS-INIT] Scripts directory not found. Checked: {Paths}. Skipping RLS auto-init.", string.Join(", ", possiblePaths));
                    return;
                }

                logger.LogInformation("[RLS-INIT] Found scripts at: {Path}", scriptsPath);

                // Scripts to apply in strict order
                var scriptFiles = new[]
                {
                    "01_SQL_RLS_SessionContext.sql",
                    "02_SQL_RLS_Predicates.sql",
                    "03_SQL_RLS_Policies.sql"
                };

                logger.LogInformation("[RLS-INIT] Starting automatic RLS schema synchronization...");

                foreach (var fileName in scriptFiles)
                {
                    var filePath = Path.Combine(scriptsPath, fileName);
                    if (File.Exists(filePath))
                    {
                        logger.LogInformation("[RLS-INIT] Executing: {FileName}", fileName);
                        var sql = await File.ReadAllTextAsync(filePath);
                        await ExecuteScriptWithGoSplitter(context, sql, fileName, logger);
                    }
                    else
                    {
                        logger.LogError("[RLS-INIT] Required RLS script missing: {FileName}", fileName);
                    }
                }

                logger.LogInformation("[RLS-INIT] RLS schema synchronization completed successfully.");
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "[RLS-INIT] Critical error during RLS schema synchronization.");
            }
        }

        /// <summary>
        /// Splits SQL script by 'GO' statements and executes each block independently.
        /// This is necessary because ExecuteSqlRaw does not support the 'GO' command.
        /// </summary>
        private static async Task ExecuteScriptWithGoSplitter(AppDbContext context, string script, string fileName, ILogger logger)
        {
            // Regex to split by 'GO' (case-insensitive, on its own line)
            var commandBlocks = Regex.Split(script, @"^\s*GO\s*$", RegexOptions.Multiline | RegexOptions.IgnoreCase);

            foreach (var block in commandBlocks)
            {
                if (string.IsNullOrWhiteSpace(block)) continue;

                try
                {
                    await context.Database.ExecuteSqlRawAsync(block);
                }
                catch (Exception ex)
                {
                    logger.LogError("[RLS-INIT] Failed to execute block in {FileName}: {Error}", fileName, ex.Message);
                    // Continue with other blocks (idempotent scripts usually handle partial failures)
                }
            }
        }
    }
}
