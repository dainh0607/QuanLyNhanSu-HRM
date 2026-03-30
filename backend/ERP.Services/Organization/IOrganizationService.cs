using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs.Branches;
using ERP.DTOs.Departments;
using ERP.DTOs.JobTitles;
using ERP.DTOs.Regions;

namespace ERP.Services.Organization
{
    public interface IOrganizationService
    {
        // Branches
        Task<IEnumerable<BranchDto>> GetBranchesAsync();
        Task<BranchDto?> GetBranchByIdAsync(int id);
        Task<BranchDto> CreateBranchAsync(BranchCreateDto dto);
        Task<bool> UpdateBranchAsync(int id, BranchUpdateDto dto);
        Task<bool> DeleteBranchAsync(int id);

        // Departments
        Task<IEnumerable<DepartmentDto>> GetDepartmentsAsync();
        Task<DepartmentDto?> GetDepartmentByIdAsync(int id);
        Task<DepartmentDto> CreateDepartmentAsync(DepartmentCreateDto dto);
        Task<bool> UpdateDepartmentAsync(int id, DepartmentUpdateDto dto);
        Task<bool> DeleteDepartmentAsync(int id);

        // JobTitles
        Task<IEnumerable<JobTitleDto>> GetJobTitlesAsync();
        Task<JobTitleDto?> GetJobTitleByIdAsync(int id);
        Task<JobTitleDto> CreateJobTitleAsync(JobTitleCreateDto dto);
        Task<bool> UpdateJobTitleAsync(int id, JobTitleUpdateDto dto);
        Task<bool> DeleteJobTitleAsync(int id);

        // Regions
        Task<IEnumerable<RegionDto>> GetRegionsAsync();
        Task<RegionDto?> GetRegionByIdAsync(int id);
        Task<RegionDto> CreateRegionAsync(RegionCreateDto dto);
        Task<bool> UpdateRegionAsync(int id, RegionUpdateDto dto);
        Task<bool> DeleteRegionAsync(int id);
    }
}
