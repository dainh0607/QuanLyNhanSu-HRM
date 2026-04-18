using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using ERP.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERP.API.Middleware
{
    public static class TenantResolutionContext
    {
        public const string TenantIdItemKey = "ResolvedTenantId";
        public const string SubdomainItemKey = "ResolvedTenantSubdomain";
        public const string TenantCodeItemKey = "ResolvedTenantCode";
        public const string TenantNameItemKey = "ResolvedTenantName";
    }

    /// <summary>
    /// Resolves a tenant workspace from the request subdomain before authentication.
    /// This lets both anonymous and authenticated flows enforce workspace-aware routing.
    /// </summary>
    public class SubdomainMiddleware
    {
        private static readonly HashSet<string> ReservedSubdomains = new(StringComparer.OrdinalIgnoreCase)
        {
            "www",
            "api",
            "admin",
            "super-admin"
        };

        private readonly RequestDelegate _next;
        private readonly ILogger<SubdomainMiddleware> _logger;

        public SubdomainMiddleware(RequestDelegate next, ILogger<SubdomainMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, AppDbContext db)
        {
            var subdomain = ResolveSubdomain(context);
            if (string.IsNullOrWhiteSpace(subdomain))
            {
                await _next(context);
                return;
            }

            var tenant = await db.Tenants
                .IgnoreQueryFilters()
                .AsNoTracking()
                .FirstOrDefaultAsync(t => t.is_active && t.subdomain != null && t.subdomain.ToLower() == subdomain);

            if (tenant == null)
            {
                _logger.LogWarning(
                    "[Tenant] Workspace not found for subdomain {Subdomain}. Path={Path}, Host={Host}",
                    subdomain,
                    context.Request.Path,
                    context.Request.Host.Value);

                context.Response.StatusCode = StatusCodes.Status404NotFound;
                await context.Response.WriteAsJsonAsync(new
                {
                    error = "Workspace not found"
                });
                return;
            }

            context.Items[TenantResolutionContext.TenantIdItemKey] = tenant.Id;
            context.Items[TenantResolutionContext.SubdomainItemKey] = tenant.subdomain ?? subdomain;
            context.Items[TenantResolutionContext.TenantCodeItemKey] = tenant.code ?? string.Empty;
            context.Items[TenantResolutionContext.TenantNameItemKey] = tenant.name ?? string.Empty;

            await _next(context);
        }

        private static string? ResolveSubdomain(HttpContext context)
        {
            var headerSubdomain = NormalizeSubdomain(context.Request.Headers["X-Subdomain"].FirstOrDefault());
            if (!string.IsNullOrWhiteSpace(headerSubdomain))
            {
                return headerSubdomain;
            }

            var forwardedHost = context.Request.Headers["X-Forwarded-Host"].FirstOrDefault();
            var host = ExtractHost(forwardedHost) ?? context.Request.Host.Host;
            if (string.IsNullOrWhiteSpace(host))
            {
                return null;
            }

            var normalizedHost = host.Trim().Trim('.').ToLowerInvariant();
            if (string.IsNullOrWhiteSpace(normalizedHost) || IsNonTenantHost(normalizedHost))
            {
                return null;
            }

            if (normalizedHost.EndsWith(".localhost", StringComparison.OrdinalIgnoreCase))
            {
                var localSegments = normalizedHost.Split('.', StringSplitOptions.RemoveEmptyEntries);
                return localSegments.Length >= 2
                    ? NormalizeSubdomain(localSegments[0])
                    : null;
            }

            var hostSegments = normalizedHost.Split('.', StringSplitOptions.RemoveEmptyEntries);
            return hostSegments.Length >= 3
                ? NormalizeSubdomain(hostSegments[0])
                : null;
        }

        private static string? ExtractHost(string? rawHost)
        {
            if (string.IsNullOrWhiteSpace(rawHost))
            {
                return null;
            }

            var candidate = rawHost
                .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
                .FirstOrDefault();

            if (string.IsNullOrWhiteSpace(candidate))
            {
                return null;
            }

            if (candidate.StartsWith("[", StringComparison.Ordinal))
            {
                var closingIndex = candidate.IndexOf(']');
                return closingIndex > 1
                    ? candidate[1..closingIndex]
                    : null;
            }

            if (candidate.Count(ch => ch == ':') == 1)
            {
                candidate = candidate[..candidate.LastIndexOf(':')];
            }

            return candidate.Trim().Trim('.').ToLowerInvariant();
        }

        private static string? NormalizeSubdomain(string? rawSubdomain)
        {
            if (string.IsNullOrWhiteSpace(rawSubdomain))
            {
                return null;
            }

            var normalized = rawSubdomain.Trim().Trim('.').ToLowerInvariant();
            return ReservedSubdomains.Contains(normalized)
                ? null
                : normalized;
        }

        private static bool IsNonTenantHost(string host)
        {
            return string.Equals(host, "localhost", StringComparison.OrdinalIgnoreCase)
                || IPAddress.TryParse(host, out _);
        }
    }

    public static class SubdomainMiddlewareExtensions
    {
        public static IApplicationBuilder UseSubdomainResolution(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<SubdomainMiddleware>();
        }
    }
}
