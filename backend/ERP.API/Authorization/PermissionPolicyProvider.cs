using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;
using System.Threading.Tasks;

namespace ERP.API.Authorization
{
    public class PermissionPolicyProvider : DefaultAuthorizationPolicyProvider
    {
        public PermissionPolicyProvider(IOptions<AuthorizationOptions> options) : base(options)
        {
        }

        public override async Task<AuthorizationPolicy> GetPolicyAsync(string policyName)
        {
            if (policyName.StartsWith("Permission_", System.StringComparison.OrdinalIgnoreCase))
            {
                var parts = policyName.Split('_');
                if (parts.Length == 3)
                {
                    var resource = parts[1];
                    var action = parts[2];
                    
                    var policy = new AuthorizationPolicyBuilder();
                    policy.AddRequirements(new PermissionRequirement(resource, action));
                    return policy.Build();
                }
            }

            return await base.GetPolicyAsync(policyName);
        }
    }
}
