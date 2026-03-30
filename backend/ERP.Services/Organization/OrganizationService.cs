using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Branches;
using ERP.DTOs.Departments;
using ERP.DTOs.JobTitles;
using ERP.DTOs.Regions;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;

namespace ERP.Services.Organization
{
    public class OrganizationService : IOrganizationService
    {
        private readonly IUnitOfWork _unitOfWork;

        public OrganizationService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        #region Branches
        public async Task<IEnumerable<BranchDto>> GetBranchesAsync()
        {
            var branches = await _unitOfWork.Repository<Branches>().GetAllAsync();
            return branches.Select(b => new BranchDto { Id = b.Id, Name = b.name, Code = b.code, Address = b.address });
        }

        public async Task<BranchDto?> GetBranchByIdAsync(int id)
        {
            var b = await _unitOfWork.Repository<Branches>().GetByIdAsync(id);
            return b == null ? null : new BranchDto { Id = b.Id, Name = b.name, Code = b.code, Address = b.address };
        }

        public async Task<BranchDto> CreateBranchAsync(BranchCreateDto dto)
        {
            var b = new Branches { name = dto.Name, code = dto.Code, address = dto.Address };
            await _unitOfWork.Repository<Branches>().AddAsync(b);
            await _unitOfWork.SaveChangesAsync();
            return new BranchDto { Id = b.Id, Name = b.name, Code = b.code, Address = b.address };
        }

        public async Task<bool> UpdateBranchAsync(int id, BranchUpdateDto dto)
        {
            var b = await _unitOfWork.Repository<Branches>().GetByIdAsync(id);
            if (b == null) return false;
            b.name = dto.Name;
            b.address = dto.Address;
            _unitOfWork.Repository<Branches>().Update(b);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteBranchAsync(int id)
        {
            var b = await _unitOfWork.Repository<Branches>().GetByIdAsync(id);
            if (b == null) return false;
            _unitOfWork.Repository<Branches>().Delete(b);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }
        #endregion

        #region Departments
        public async Task<IEnumerable<DepartmentDto>> GetDepartmentsAsync()
        {
            var depts = await _unitOfWork.Repository<Departments>().GetAllAsync();
            return depts.Select(d => new DepartmentDto { Id = d.Id, Name = d.name, Code = d.code, ParentId = d.parent_id });
        }

        public async Task<DepartmentDto?> GetDepartmentByIdAsync(int id)
        {
            var d = await _unitOfWork.Repository<Departments>().GetByIdAsync(id);
            return d == null ? null : new DepartmentDto { Id = d.Id, Name = d.name, Code = d.code, ParentId = d.parent_id };
        }

        public async Task<DepartmentDto> CreateDepartmentAsync(DepartmentCreateDto dto)
        {
            var d = new Departments { name = dto.Name, code = dto.Code, parent_id = dto.ParentId };
            await _unitOfWork.Repository<Departments>().AddAsync(d);
            await _unitOfWork.SaveChangesAsync();
            return new DepartmentDto { Id = d.Id, Name = d.name, Code = d.code, ParentId = d.parent_id };
        }

        public async Task<bool> UpdateDepartmentAsync(int id, DepartmentUpdateDto dto)
        {
            var d = await _unitOfWork.Repository<Departments>().GetByIdAsync(id);
            if (d == null) return false;
            d.name = dto.Name;
            d.parent_id = dto.ParentId;
            _unitOfWork.Repository<Departments>().Update(d);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteDepartmentAsync(int id)
        {
            var d = await _unitOfWork.Repository<Departments>().GetByIdAsync(id);
            if (d == null) return false;
            _unitOfWork.Repository<Departments>().Delete(d);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }
        #endregion

        #region JobTitles
        public async Task<IEnumerable<JobTitleDto>> GetJobTitlesAsync()
        {
            var jobs = await _unitOfWork.Repository<JobTitles>().GetAllAsync();
            return jobs.Select(j => new JobTitleDto { Id = j.Id, Name = j.name, Code = j.code });
        }

        public async Task<JobTitleDto?> GetJobTitleByIdAsync(int id)
        {
            var j = await _unitOfWork.Repository<JobTitles>().GetByIdAsync(id);
            return j == null ? null : new JobTitleDto { Id = j.Id, Name = j.name, Code = j.code };
        }

        public async Task<JobTitleDto> CreateJobTitleAsync(JobTitleCreateDto dto)
        {
            var j = new JobTitles { name = dto.Name, code = dto.Code };
            await _unitOfWork.Repository<JobTitles>().AddAsync(j);
            await _unitOfWork.SaveChangesAsync();
            return new JobTitleDto { Id = j.Id, Name = j.name, Code = j.code };
        }

        public async Task<bool> UpdateJobTitleAsync(int id, JobTitleUpdateDto dto)
        {
            var j = await _unitOfWork.Repository<JobTitles>().GetByIdAsync(id);
            if (j == null) return false;
            j.name = dto.Name;
            _unitOfWork.Repository<JobTitles>().Update(j);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteJobTitleAsync(int id)
        {
            var j = await _unitOfWork.Repository<JobTitles>().GetByIdAsync(id);
            if (j == null) return false;
            _unitOfWork.Repository<JobTitles>().Delete(j);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }
        #endregion

        #region Regions
        public async Task<IEnumerable<RegionDto>> GetRegionsAsync()
        {
            var regions = await _unitOfWork.Repository<Regions>().GetAllAsync();
            return regions.Select(r => new RegionDto { Id = r.Id, Name = r.name, Code = r.code });
        }

        public async Task<RegionDto?> GetRegionByIdAsync(int id)
        {
            var r = await _unitOfWork.Repository<Regions>().GetByIdAsync(id);
            return r == null ? null : new RegionDto { Id = r.Id, Name = r.name, Code = r.code };
        }

        public async Task<RegionDto> CreateRegionAsync(RegionCreateDto dto)
        {
            var r = new Regions { name = dto.Name, code = dto.Code };
            await _unitOfWork.Repository<Regions>().AddAsync(r);
            await _unitOfWork.SaveChangesAsync();
            return new RegionDto { Id = r.Id, Name = r.name, Code = r.code };
        }

        public async Task<bool> UpdateRegionAsync(int id, RegionUpdateDto dto)
        {
            var r = await _unitOfWork.Repository<Regions>().GetByIdAsync(id);
            if (r == null) return false;
            r.name = dto.Name;
            _unitOfWork.Repository<Regions>().Update(r);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteRegionAsync(int id)
        {
            var r = await _unitOfWork.Repository<Regions>().GetByIdAsync(id);
            if (r == null) return false;
            _unitOfWork.Repository<Regions>().Delete(r);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }
        #endregion
    }
}
