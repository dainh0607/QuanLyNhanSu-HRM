using System.Collections.Generic;

namespace ERP.DTOs.Auth
{
    public class PermissionMatrixDto
    {
        public string ModuleCode { get; set; }
        public string ModuleName { get; set; }
        public List<FeatureInfoDto> Features { get; set; }
        public List<RoleSummaryDto> Roles { get; set; }
        public List<FeaturePermissionValueDto> PermissionValues { get; set; }
    }

    public class FeatureInfoDto
    {
        public string Code { get; set; }
        public string Name { get; set; }
    }

    public class FeaturePermissionValueDto
    {
        public int RoleId { get; set; }
        public string FeatureCode { get; set; }
        public bool IsGranted { get; set; }
    }

    public class PermissionMatrixUpdateDto
    {
        public string ModuleCode { get; set; }
        public List<FeaturePermissionValueDto> PermissionValues { get; set; }
    }
}
