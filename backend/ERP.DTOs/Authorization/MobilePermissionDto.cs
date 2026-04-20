using System.Collections.Generic;

namespace ERP.DTOs.Authorization
{
    public class MobilePermissionNodeDto
    {
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsModule { get; set; }
        public bool IsAllowed { get; set; }
        public List<MobilePermissionNodeDto> Children { get; set; } = new();
    }

    public class UpdateMobilePermissionsDto
    {
        public List<int> AllowedPermissionIds { get; set; } = new();
    }
}
