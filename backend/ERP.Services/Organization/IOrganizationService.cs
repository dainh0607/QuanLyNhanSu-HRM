using System.Collections.Generic;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Branches;
using ERP.DTOs.Departments;
using ERP.DTOs.JobTitles;
using ERP.DTOs.Regions;

namespace ERP.Services.Organization
{
    public interface IOrganizationService
    {
        // Branches
        Task<PaginatedListDto<BranchDto>> GetPagedBranchesAsync(int pageNumber, int pageSize, string? searchTerm);
        Task<IEnumerable<BranchDto>> GetBranchesDropdownAsync(int? regionId = null);
        Task<BranchDto?> GetBranchByIdAsync(int id);
        Task<BranchDto> CreateBranchAsync(BranchCreateDto dto);
        Task<bool> UpdateBranchAsync(int id, BranchUpdateDto dto);
        Task<bool> DeleteBranchAsync(int id);

        // Departments
        Task<PaginatedListDto<DepartmentDto>> GetPagedDepartmentsAsync(int pageNumber, int pageSize, string? searchTerm);
        Task<IEnumerable<DepartmentDto>> GetDepartmentsDropdownAsync(int? branchId = null);
        Task<DepartmentDto?> GetDepartmentByIdAsync(int id);
        Task<DepartmentDto> CreateDepartmentAsync(DepartmentCreateDto dto);
        Task<bool> UpdateDepartmentAsync(int id, DepartmentUpdateDto dto);
        Task<bool> DeleteDepartmentAsync(int id);

        // JobTitles
        Task<PaginatedListDto<JobTitleDto>> GetPagedJobTitlesAsync(int pageNumber, int pageSize, string? searchTerm);
        Task<IEnumerable<JobTitleDto>> GetJobTitlesDropdownAsync();
        Task<JobTitleDto?> GetJobTitleByIdAsync(int id);
        Task<JobTitleDto> CreateJobTitleAsync(JobTitleCreateDto dto);
        Task<bool> UpdateJobTitleAsync(int id, JobTitleUpdateDto dto);
        Task<bool> DeleteJobTitleAsync(int id);

        // Regions
        Task<PaginatedListDto<RegionDto>> GetPagedRegionsAsync(int pageNumber, int pageSize, string? searchTerm);
        Task<IEnumerable<RegionDto>> GetRegionsDropdownAsync();
        Task<RegionDto?> GetRegionByIdAsync(int id);
        Task<RegionDto> CreateRegionAsync(RegionCreateDto dto);
        Task<bool> UpdateRegionAsync(int id, RegionUpdateDto dto);
        Task<bool> DeleteRegionAsync(int id);

        // Bulk Delete
        Task<int> BulkDeleteBranchesAsync(List<int> ids);
        Task<int> BulkDeleteDepartmentsAsync(List<int> ids);
        Task<int> BulkDeleteJobTitlesAsync(List<int> ids);
        Task<int> BulkDeleteRegionsAsync(List<int> ids);
    }
}
