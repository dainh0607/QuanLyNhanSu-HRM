using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Branches;
using ERP.DTOs.Departments;
using ERP.DTOs.JobTitles;
using ERP.DTOs.Regions;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Organization
{
    public class OrganizationService : IOrganizationService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public OrganizationService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        #region Helper Methods
        private async Task ValidateUniqueCode<T>(string code, int? id = null) where T : class
        {
            var query = _context.Set<T>().AsQueryable();
            
            // Note: tenant_id filter is already applied by global query filter if T implements ITenantEntity
            
            // We need to use reflection or a common interface if we want a truly generic way, 
            // but for these 4 models, they all have 'code' and 'Id' properties.
            
            bool exists = false;
            if (typeof(T) == typeof(Regions))
                exists = await _context.Regions.AnyAsync(r => r.code == code && (!id.HasValue || r.Id != id.Value));
            else if (typeof(T) == typeof(Branches))
                exists = await _context.Branches.AnyAsync(b => b.code == code && (!id.HasValue || b.Id != id.Value));
            else if (typeof(T) == typeof(Departments))
                exists = await _context.Departments.AnyAsync(d => d.code == code && (!id.HasValue || d.Id != id.Value));
            else if (typeof(T) == typeof(JobTitles))
                exists = await _context.JobTitles.AnyAsync(j => j.code == code && (!id.HasValue || j.Id != id.Value));

            if (exists)
            {
                throw new ArgumentException($"Mã '{code}' đã tồn tại trong hệ thống.");
            }
        }
        #endregion

        #region Branches
        public async Task<PaginatedListDto<BranchDto>> GetPagedBranchesAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            var query = _context.Branches.Include(b => b.Region).AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(b => b.name.Contains(searchTerm) || b.code.Contains(searchTerm));
            }

            var count = await query.CountAsync();
            var items = await query.OrderBy(b => b.display_order).ThenByDescending(b => b.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(b => new BranchDto
                {
                    Id = b.Id,
                    Name = b.name,
                    Code = b.code,
                    RegionId = b.region_id,
                    RegionName = b.Region != null ? b.Region.name : null,
                    ParentId = b.parent_id,
                    ParentName = b.ParentBranch != null ? b.ParentBranch.name : null,
                    CountryCode = b.country_code,
                    ProvinceCode = b.province_code,
                    DistrictCode = b.district_code,
                    Address = b.address,
                    PhoneCountryPrefix = b.phone_country_prefix,
                    PhoneNumber = b.phone_number,
                    ColorCode = b.color_code,
                    DisplayOrder = b.display_order,
                    Note = b.note,
                    CreatedAt = b.CreatedAt
                })
                .ToListAsync();

            return new PaginatedListDto<BranchDto>(items, count, pageNumber, pageSize);
        }

        public async Task<IEnumerable<BranchDto>> GetBranchesDropdownAsync(int? regionId = null)
        {
            var query = _context.Branches.AsNoTracking();
            if (regionId.HasValue)
                query = query.Where(b => b.region_id == regionId.Value);

            return await query.OrderBy(b => b.name)
                .Select(b => new BranchDto { Id = b.Id, Name = b.name, Code = b.code })
                .ToListAsync();
        }

        public async Task<BranchDto?> GetBranchByIdAsync(int id)
        {
            var b = await _context.Branches
                .Include(x => x.Region)
                .Include(x => x.ParentBranch)
                .FirstOrDefaultAsync(b => b.Id == id);
            
            return b == null ? null : new BranchDto
            {
                Id = b.Id,
                Name = b.name,
                Code = b.code,
                RegionId = b.region_id,
                RegionName = b.Region?.name,
                ParentId = b.parent_id,
                ParentName = b.ParentBranch?.name,
                CountryCode = b.country_code,
                ProvinceCode = b.province_code,
                DistrictCode = b.district_code,
                Address = b.address,
                PhoneCountryPrefix = b.phone_country_prefix,
                PhoneNumber = b.phone_number,
                ColorCode = b.color_code,
                DisplayOrder = b.display_order,
                Note = b.note,
                CreatedAt = b.CreatedAt
            };
        }

        public async Task<BranchDto> CreateBranchAsync(BranchCreateDto dto)
        {
            await ValidateUniqueCode<Branches>(dto.Code);
            var b = new Branches
            {
                name = dto.Name,
                code = dto.Code,
                region_id = dto.RegionId,
                parent_id = dto.ParentId,
                country_code = dto.CountryCode,
                province_code = dto.ProvinceCode,
                district_code = dto.DistrictCode,
                address = dto.Address,
                phone_country_prefix = dto.PhoneCountryPrefix,
                phone_number = dto.PhoneNumber,
                color_code = dto.ColorCode,
                display_order = dto.DisplayOrder,
                note = dto.Note
            };
            _context.Branches.Add(b);
            await _context.SaveChangesAsync();
            return await GetBranchByIdAsync(b.Id);
        }

        public async Task<bool> UpdateBranchAsync(int id, BranchUpdateDto dto)
        {
            await ValidateUniqueCode<Branches>(dto.Code, id);
            var b = await _context.Branches.FindAsync(id);
            if (b == null) return false;

            // Circular dependency check
            if (dto.ParentId.HasValue)
            {
                await CheckBranchCircularDependency(id, dto.ParentId);
            }

            b.name = dto.Name;
            b.code = dto.Code;
            b.region_id = dto.RegionId;
            b.parent_id = dto.ParentId;
            b.country_code = dto.CountryCode;
            b.province_code = dto.ProvinceCode;
            b.district_code = dto.DistrictCode;
            b.address = dto.Address;
            b.phone_country_prefix = dto.PhoneCountryPrefix;
            b.phone_number = dto.PhoneNumber;
            b.color_code = dto.ColorCode;
            b.display_order = dto.DisplayOrder;
            b.note = dto.Note;

            return await _context.SaveChangesAsync() > 0;
        }

        private async Task CheckBranchCircularDependency(int branchId, int? parentId)
        {
            if (!parentId.HasValue) return;
            if (branchId == parentId.Value)
                throw new InvalidOperationException("Chi nhánh không thể là cha của chính nó.");

            var currentParentId = parentId;
            while (currentParentId.HasValue)
            {
                var parent = await _context.Branches.AsNoTracking().FirstOrDefaultAsync(x => x.Id == currentParentId.Value);
                if (parent == null) break;
                if (parent.parent_id == branchId)
                    throw new InvalidOperationException("Không thể thiết lập quan hệ cha-con vì sẽ gây ra vòng lặp vô tận.");
                currentParentId = parent.parent_id;
            }
        }

        public async Task<bool> DeleteBranchAsync(int id)
        {
            var b = await _context.Branches.FindAsync(id);
            if (b == null) return false;

            // Constraint check: Check if any employee is linked to this branch
            if (await _context.Employees.AnyAsync(e => e.branch_id == id || e.secondary_branch_id == id))
            {
                throw new InvalidOperationException($"Không thể xóa chi nhánh '{b.name}' vì đang có nhân viên thuộc chi nhánh này.");
            }
            
            // Check if any department is linked to this branch
            if (await _context.Departments.AnyAsync(d => d.branch_id == id))
            {
                throw new InvalidOperationException($"Không thể xóa chi nhánh '{b.name}' vì đang có phòng ban trực thuộc.");
            }

            // Check if any sub-branch is linked to this branch
            if (await _context.Branches.AnyAsync(sub => sub.parent_id == id))
            {
                throw new InvalidOperationException($"Không thể xóa chi nhánh '{b.name}' vì đang có các chi nhánh con trực thuộc.");
            }

            _context.Branches.Remove(b);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<int> BulkDeleteBranchesAsync(List<int> ids)
        {
            int count = 0;
            foreach (var id in ids)
            {
                try { if (await DeleteBranchAsync(id)) count++; } catch { /* Skip if constrained */ }
            }
            return count;
        }
        #endregion

        #region Departments
        public async Task<PaginatedListDto<DepartmentDto>> GetPagedDepartmentsAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            var query = _context.Departments.Include(d => d.Branch).AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(d => d.name.Contains(searchTerm) || d.code.Contains(searchTerm));
            }

            var count = await query.CountAsync();
            var items = await query.OrderBy(d => d.display_order).ThenByDescending(d => d.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(d => new DepartmentDto
                {
                    Id = d.Id,
                    Name = d.name,
                    Code = d.code,
                    BranchId = d.branch_id,
                    BranchName = d.Branch != null ? d.Branch.name : null,
                    ParentId = d.parent_id,
                    ParentName = d.ParentDepartment != null ? d.ParentDepartment.name : null,
                    IsHeadDepartment = d.is_head_department,
                    DisplayOrder = d.display_order,
                    Note = d.note,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();

            return new PaginatedListDto<DepartmentDto>(items, count, pageNumber, pageSize);
        }

        public async Task<IEnumerable<DepartmentDto>> GetDepartmentsDropdownAsync(int? branchId = null)
        {
            var query = _context.Departments.AsNoTracking();
            if (branchId.HasValue)
                query = query.Where(d => d.branch_id == branchId.Value);

            return await query.OrderBy(d => d.name)
                .Select(d => new DepartmentDto { Id = d.Id, Name = d.name, Code = d.code })
                .ToListAsync();
        }

        public async Task<DepartmentDto?> GetDepartmentByIdAsync(int id)
        {
            var d = await _context.Departments
                .Include(d => d.Branch)
                .Include(d => d.ParentDepartment)
                .FirstOrDefaultAsync(x => x.Id == id);
                
            return d == null ? null : new DepartmentDto
            {
                Id = d.Id,
                Name = d.name,
                Code = d.code,
                BranchId = d.branch_id,
                BranchName = d.Branch?.name,
                ParentId = d.parent_id,
                ParentName = d.ParentDepartment?.name,
                IsHeadDepartment = d.is_head_department,
                DisplayOrder = d.display_order,
                Note = d.note,
                CreatedAt = d.CreatedAt
            };
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(DepartmentCreateDto dto)
        {
            await ValidateUniqueCode<Departments>(dto.Code);
            var d = new Departments
            {
                name = dto.Name,
                code = dto.Code,
                branch_id = dto.BranchId,
                parent_id = dto.IsHeadDepartment ? null : dto.ParentId,
                is_head_department = dto.IsHeadDepartment,
                display_order = dto.DisplayOrder,
                note = dto.Note
            };
            _context.Departments.Add(d);
            await _context.SaveChangesAsync();
            return await GetDepartmentByIdAsync(d.Id);
        }

        public async Task<bool> UpdateDepartmentAsync(int id, DepartmentUpdateDto dto)
        {
            await ValidateUniqueCode<Departments>(dto.Code, id);
            var d = await _context.Departments.FindAsync(id);
            if (d == null) return false;

            // Circular dependency check
            if (!dto.IsHeadDepartment && dto.ParentId.HasValue)
            {
                await CheckDepartmentCircularDependency(id, dto.ParentId);
            }

            d.name = dto.Name;
            d.code = dto.Code;
            d.branch_id = dto.BranchId;
            d.parent_id = dto.IsHeadDepartment ? null : dto.ParentId;
            d.is_head_department = dto.IsHeadDepartment;
            d.display_order = dto.DisplayOrder;
            d.note = dto.Note;

            return await _context.SaveChangesAsync() > 0;
        }

        private async Task CheckDepartmentCircularDependency(int deptId, int? parentId)
        {
            if (!parentId.HasValue) return;
            if (deptId == parentId.Value)
                throw new InvalidOperationException("Phòng ban không thể là cha của chính nó.");

            var currentParentId = parentId;
            while (currentParentId.HasValue)
            {
                var parent = await _context.Departments.AsNoTracking().FirstOrDefaultAsync(x => x.Id == currentParentId.Value);
                if (parent == null) break;
                if (parent.parent_id == deptId)
                    throw new InvalidOperationException("Không thể thiết lập quan hệ cha-con vì sẽ gây ra vòng lặp vô tận.");
                currentParentId = parent.parent_id;
            }
        }

        public async Task<bool> DeleteDepartmentAsync(int id)
        {
            var d = await _context.Departments.FindAsync(id);
            if (d == null) return false;

            // Constraint check: Check if any employee is linked to this department
            if (await _context.Employees.AnyAsync(e => e.department_id == id || e.secondary_department_id == id))
            {
                throw new InvalidOperationException($"Không thể xóa phòng ban '{d.name}' vì đang có nhân viên trực thuộc.");
            }

            // Check if any sub-departments exist
            if (await _context.Departments.AnyAsync(dept => dept.parent_id == id))
            {
                throw new InvalidOperationException($"Không thể xóa phòng ban '{d.name}' vì đang có phòng ban cấp con trực thuộc.");
            }

            _context.Departments.Remove(d);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<int> BulkDeleteDepartmentsAsync(List<int> ids)
        {
            int count = 0;
            foreach (var id in ids)
            {
                try { if (await DeleteDepartmentAsync(id)) count++; } catch { }
            }
            return count;
        }
        #endregion

        #region JobTitles
        public async Task<PaginatedListDto<JobTitleDto>> GetPagedJobTitlesAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            var query = _context.JobTitles
                .Include(j => j.ParentJobTitle)
                .Include(j => j.Branch)
                .Include(j => j.Department)
                .AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(j => j.name.Contains(searchTerm) || j.code.Contains(searchTerm));
            }

            var count = await query.CountAsync();
            var items = await query.OrderBy(j => j.display_order).ThenByDescending(j => j.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(j => new JobTitleDto
                {
                    Id = j.Id,
                    Name = j.name,
                    Code = j.code,
                    ParentId = j.parent_id,
                    ParentName = j.ParentJobTitle != null ? j.ParentJobTitle.name : null,
                    BranchId = j.branch_id,
                    BranchName = j.Branch != null ? j.Branch.name : null,
                    DepartmentId = j.department_id,
                    DepartmentName = j.Department != null ? j.Department.name : null,
                    Qualification = j.qualification,
                    Experience = j.experience,
                    DisplayOrder = j.display_order,
                    Note = j.note,
                    CreatedAt = j.CreatedAt
                })
                .ToListAsync();

            return new PaginatedListDto<JobTitleDto>(items, count, pageNumber, pageSize);
        }

        public async Task<IEnumerable<JobTitleDto>> GetJobTitlesDropdownAsync()
        {
            return await _context.JobTitles.AsNoTracking()
                .OrderBy(j => j.name)
                .Select(j => new JobTitleDto { Id = j.Id, Name = j.name, Code = j.code })
                .ToListAsync();
        }

        public async Task<JobTitleDto?> GetJobTitleByIdAsync(int id)
        {
            var j = await _context.JobTitles
                .Include(x => x.ParentJobTitle)
                .Include(x => x.Branch)
                .Include(x => x.Department)
                .FirstOrDefaultAsync(x => x.Id == id);
                
            return j == null ? null : new JobTitleDto
            {
                Id = j.Id,
                Name = j.name,
                Code = j.code,
                ParentId = j.parent_id,
                ParentName = j.ParentJobTitle?.name,
                BranchId = j.branch_id,
                BranchName = j.Branch?.name,
                DepartmentId = j.department_id,
                DepartmentName = j.Department?.name,
                Qualification = j.qualification,
                Experience = j.experience,
                DisplayOrder = j.display_order,
                Note = j.note,
                CreatedAt = j.CreatedAt
            };
        }

        public async Task<JobTitleDto> CreateJobTitleAsync(JobTitleCreateDto dto)
        {
            await ValidateUniqueCode<JobTitles>(dto.Code);
            var j = new JobTitles
            {
                name = dto.Name,
                code = dto.Code,
                parent_id = dto.ParentId,
                branch_id = dto.BranchId,
                department_id = dto.DepartmentId,
                qualification = dto.Qualification,
                experience = dto.Experience,
                display_order = dto.DisplayOrder,
                note = dto.Note
            };
            _context.JobTitles.Add(j);
            await _context.SaveChangesAsync();
            return await GetJobTitleByIdAsync(j.Id);
        }

        public async Task<bool> UpdateJobTitleAsync(int id, JobTitleUpdateDto dto)
        {
            await ValidateUniqueCode<JobTitles>(dto.Code, id);
            var j = await _context.JobTitles.FindAsync(id);
            if (j == null) return false;

            // Circular dependency check
            if (dto.ParentId.HasValue)
            {
                await CheckJobTitleCircularDependency(id, dto.ParentId);
            }

            j.name = dto.Name;
            j.code = dto.Code;
            j.parent_id = dto.ParentId;
            j.branch_id = dto.BranchId;
            j.department_id = dto.DepartmentId;
            j.qualification = dto.Qualification;
            j.experience = dto.Experience;
            j.display_order = dto.DisplayOrder;
            j.note = dto.Note;

            return await _context.SaveChangesAsync() > 0;
        }

        private async Task CheckJobTitleCircularDependency(int jobId, int? parentId)
        {
            if (!parentId.HasValue) return;
            if (jobId == parentId.Value)
                throw new InvalidOperationException("Chức danh không thể là cấp trên của chính nó.");

            var currentParentId = parentId;
            while (currentParentId.HasValue)
            {
                var parent = await _context.JobTitles.AsNoTracking().FirstOrDefaultAsync(x => x.Id == currentParentId.Value);
                if (parent == null) break;
                if (parent.parent_id == jobId)
                    throw new InvalidOperationException("Không thể thiết lập tuyến báo cáo vì sẽ gây ra vòng lặp vô tận.");
                currentParentId = parent.parent_id;
            }
        }

        public async Task<bool> DeleteJobTitleAsync(int id)
        {
            var j = await _context.JobTitles.FindAsync(id);
            if (j == null) return false;

            // Constraint check: Employees using this title
            if (await _context.Employees.AnyAsync(e => e.job_title_id == id || e.secondary_job_title_id == id))
            {
                throw new InvalidOperationException($"Không thể xóa chức danh '{j.name}' vì đang có nhân viên trực thuộc.");
            }

            // Constraint check: Sub-titles using this title as parent
            if (await _context.JobTitles.AnyAsync(sub => sub.parent_id == id))
            {
                throw new InvalidOperationException($"Không thể xóa chức danh '{j.name}' vì đang là cấp trên của chức danh khác.");
            }

            _context.JobTitles.Remove(j);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<int> BulkDeleteJobTitlesAsync(List<int> ids)
        {
            int count = 0;
            foreach (var id in ids)
            {
                try { if (await DeleteJobTitleAsync(id)) count++; } catch { }
            }
            return count;
        }
        #endregion

        #region Regions
        public async Task<PaginatedListDto<RegionDto>> GetPagedRegionsAsync(int pageNumber, int pageSize, string? searchTerm)
        {
            var query = _context.Regions.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                query = query.Where(r => r.name.Contains(searchTerm) || r.code.Contains(searchTerm));
            }

            var count = await query.CountAsync();
            var items = await query.OrderByDescending(r => r.CreatedAt)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .Select(r => new RegionDto
                {
                    Id = r.Id,
                    Name = r.name,
                    Code = r.code,
                    Note = r.note,
                    CreatedAt = r.CreatedAt
                })
                .ToListAsync();

            return new PaginatedListDto<RegionDto>(items, count, pageNumber, pageSize);
        }

        public async Task<IEnumerable<RegionDto>> GetRegionsDropdownAsync()
        {
            return await _context.Regions.AsNoTracking()
                .OrderBy(r => r.name)
                .Select(r => new RegionDto { Id = r.Id, Name = r.name, Code = r.code })
                .ToListAsync();
        }

        public async Task<RegionDto?> GetRegionByIdAsync(int id)
        {
            var r = await _context.Regions.FindAsync(id);
            return r == null ? null : new RegionDto
            {
                Id = r.Id,
                Name = r.name,
                Code = r.code,
                Note = r.note,
                CreatedAt = r.CreatedAt
            };
        }

        public async Task<RegionDto> CreateRegionAsync(RegionCreateDto dto)
        {
            await ValidateUniqueCode<Regions>(dto.Code);
            var r = new Regions
            {
                name = dto.Name,
                code = dto.Code,
                note = dto.Note
            };
            _context.Regions.Add(r);
            await _context.SaveChangesAsync();
            return await GetRegionByIdAsync(r.Id);
        }

        public async Task<bool> UpdateRegionAsync(int id, RegionUpdateDto dto)
        {
            await ValidateUniqueCode<Regions>(dto.Code, id);
            var r = await _context.Regions.FindAsync(id);
            if (r == null) return false;

            r.name = dto.Name;
            r.code = dto.Code;
            r.note = dto.Note;

            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteRegionAsync(int id)
        {
            var r = await _context.Regions.FindAsync(id);
            if (r == null) return false;

            // Constraint check: Check if any branch is linked to this region
            if (await _context.Branches.AnyAsync(b => b.region_id == id))
            {
                throw new InvalidOperationException($"Không thể xóa vùng '{r.name}' vì đang có chi nhánh trực thuộc.");
            }

            _context.Regions.Remove(r);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<int> BulkDeleteRegionsAsync(List<int> ids)
        {
            int count = 0;
            foreach (var id in ids)
            {
                try { if (await DeleteRegionAsync(id)) count++; } catch { }
            }
            return count;
        }
        #endregion
    }
}
