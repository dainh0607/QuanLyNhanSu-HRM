using System.Security.Claims;
using ERP.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace ERP.API.Auth
{
    public class FirebaseClaimsTransformation : IClaimsTransformation
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public FirebaseClaimsTransformation(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            // If the principal is already transformed or not authenticated, skip
            if (principal.HasClaim(c => c.Type == ClaimTypes.Role) || principal.Identity?.IsAuthenticated != true)
            {
                return principal;
            }

            // Get the Firebase UID from the claims (usually 'sub' or 'NameIdentifier')
            var uid = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(uid))
            {
                return principal;
            }

            using (var scope = _scopeFactory.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

                // Find local user and their roles
                var user = await context.Users.AsNoTracking()
                    .Where(u => u.firebase_uid == uid && u.is_active)
                    .FirstOrDefaultAsync();

                if (user != null)
                {
                    var userRoles = await context.UserRoles.AsNoTracking()
                        .Where(ur => ur.user_id == user.Id && ur.is_active)
                        .Include(ur => ur.Role)
                        .ToListAsync();

                    if (userRoles.Any())
                    {
                        var identity = (ClaimsIdentity)principal.Identity!;
                        
                        // Add is_system_admin claim if Role 1 and no tenant_id
                        if (user.tenant_id == null && userRoles.Any(ur => ur.role_id == 1))
                        {
                            identity.AddClaim(new Claim("is_system_admin", "true"));
                        }

                        foreach (var ur in userRoles)
                        {
                            identity.AddClaim(new Claim(ClaimTypes.Role, ur.Role.name));
                        }
                    }
                }
            }

            return principal;
        }
    }
}
