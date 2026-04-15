using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using ERP.Services.Authorization;
using ERP.Entities.Interfaces;

namespace ERP.API.Authorization
{
    public class PermissionHandler : AuthorizationHandler<PermissionRequirement>
    {
        private readonly ERP.Services.Authorization.IAuthorizationService _rbacService;
        private readonly ICurrentUserContext _userContext;

        public PermissionHandler(ERP.Services.Authorization.IAuthorizationService rbacService, ICurrentUserContext userContext)
        {
            _rbacService = rbacService;
            _userContext = userContext;
        }

        protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PermissionRequirement requirement)
        {
            if (!_userContext.IsAuthenticated)
            {
                return;
            }

            // check database for the specific permission
            var hasPermission = await _rbacService.CanPerformAction(
                _userContext.UserId.Value,
                requirement.Action,
                requirement.Resource
            );

            if (hasPermission)
            {
                context.Succeed(requirement);
            }
        }
    }
}
