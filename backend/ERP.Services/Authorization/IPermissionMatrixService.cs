using System.Threading.Tasks;
using ERP.DTOs.Auth;

namespace ERP.Services.Authorization
{
    public interface IPermissionMatrixService
    {
        Task<PermissionMatrixDto> GetMatrixByModuleAsync(string moduleCode);
        Task<bool> UpdateMatrixAsync(PermissionMatrixUpdateDto dto);
    }
}
