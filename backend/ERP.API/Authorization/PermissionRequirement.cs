using Microsoft.AspNetCore.Authorization;

namespace ERP.API.Authorization
{
    public class PermissionRequirement : IAuthorizationRequirement
    {
        public string Resource { get; }
        public string Action { get; }

        public PermissionRequirement(string resource, string action)
        {
            Resource = resource;
            Action = action;
        }
    }
}
