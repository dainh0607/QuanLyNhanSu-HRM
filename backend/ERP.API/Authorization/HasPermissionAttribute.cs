using Microsoft.AspNetCore.Authorization;
using System;

namespace ERP.API.Authorization
{
    [AttributeUsage(AttributeTargets.Method | AttributeTargets.Class, AllowMultiple = true)]
    public class HasPermissionAttribute : AuthorizeAttribute
    {
        public string Resource { get; }
        public string Action { get; }

        public HasPermissionAttribute(string resource, string action) : base($"Permission_{resource}_{action}")
        {
            Resource = resource;
            Action = action;
        }
    }
}
