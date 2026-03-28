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
                var userRoles = await context.UserRoles
                    .Where(ur => ur.User.firebase_uid == uid && ur.is_active)
                    .Include(ur => ur.Role)
                    .Select(ur => ur.Role.name)
                    .ToListAsync();

                if (userRoles.Any())
                {
                    var identity = (ClaimsIdentity)principal.Identity!;
                    foreach (var role in userRoles)
                    {
                        identity.AddClaim(new Claim(ClaimTypes.Role, role));
                    }
                }
            }

            return principal;
        }
    }
}
