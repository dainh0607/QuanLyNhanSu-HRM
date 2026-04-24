using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Settings;

namespace ERP.Services.Settings
{
    public interface ISystemFieldService
    {
        Task<List<SystemFieldGroupDto>> GetDefaultFieldsAsync();
    }
}
