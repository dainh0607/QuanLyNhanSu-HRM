using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Contracts;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Contracts
{
    public class ContractService : IContractService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ContractService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<PaginatedListDto<ContractListItemDto>> GetPagedListAsync(ContractFilterDto filter)
        {
            var query = _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .Include(x => x.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(x => x.Employee)
                    .ThenInclude(e => e.Department)
                .Include(x => x.Employee)
                    .ThenInclude(e => e.JobTitle)
                .Include(x => x.ContractType)
                .AsQueryable();

            // 1. Filtering
            if (!string.IsNullOrEmpty(filter.Search))
            {
                query = query.Where(x => x.contract_number.Contains(filter.Search) || 
                                         x.Employee.full_name.Contains(filter.Search) ||
                                         x.Employee.employee_code.Contains(filter.Search));
            }

            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(x => x.status == filter.Status);
            }

            if (filter.ContractTypeId.HasValue)
            {
                query = query.Where(x => x.contract_type_id == filter.ContractTypeId);
            }

            if (filter.BranchId.HasValue)
            {
                query = query.Where(x => x.Employee.branch_id == filter.BranchId);
            }

            if (filter.DepartmentId.HasValue)
            {
                query = query.Where(x => x.Employee.department_id == filter.DepartmentId);
            }

            if (filter.FromDate.HasValue)
            {
                query = query.Where(x => x.effective_date >= filter.FromDate);
            }

            if (filter.ToDate.HasValue)
            {
                query = query.Where(x => x.effective_date <= filter.ToDate);
            }

            // 2. Counting
            var totalCount = await query.CountAsync();

            // 3. Paging & Projection
            var items = await query
                .OrderByDescending(x => x.effective_date)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .Select(x => new ContractListItemDto
                {
                    Id = x.Id,
                    ContractNumber = x.contract_number,
                    Status = x.status,
                    StatusLabel = MapStatusToLabel(x.status),
                    StatusColor = MapStatusToColor(x.status),
                    SignDate = x.sign_date,
                    EffectiveDate = x.effective_date,
                    ExpiryDate = x.expiry_date,
                    EmployeeId = x.employee_id,
                    EmployeeCode = x.Employee.employee_code,
                    FullName = x.Employee.full_name,
                    BranchName = x.Employee.Branch.name,
                    DepartmentName = x.Employee.Department.name,
                    JobTitleName = x.Employee.JobTitle.name,
                    ContractTypeId = x.contract_type_id,
                    ContractTypeName = x.ContractType.name,
                    SignedBy = x.signed_by,
                    TaxType = x.tax_type,
                    Attachment = x.attachment
                })
                .ToListAsync();

            return new PaginatedListDto<ContractListItemDto>(items, totalCount, filter.PageNumber, filter.PageSize);
        }

        public async Task<ContractSummaryDto> GetSummaryAsync()
        {
            var repo = _unitOfWork.Repository<Entities.Models.Contracts>();
            var today = DateTime.Today;
            var expiringThreshold = today.AddDays(30);

            var allContracts = await repo.AsQueryable().ToListAsync();

            return new ContractSummaryDto
            {
                TotalContracts = allContracts.Count,
                ActiveContracts = allContracts.Count(c => c.status == "Active"),
                ExpiredContracts = allContracts.Count(c => c.status == "Expired" || (c.expiry_date.HasValue && c.expiry_date < today)),
                ExpiringSoon = allContracts.Count(c => c.status == "Active" && c.expiry_date.HasValue && c.expiry_date >= today && c.expiry_date <= expiringThreshold),
                DraftContracts = allContracts.Count(c => c.status == "Draft"),
                ProbationContracts = allContracts.Count(c => c.ContractType != null && c.ContractType.name.Contains("Thử việc")),
                OfficialContracts = allContracts.Count(c => c.ContractType != null && c.ContractType.name.Contains("Chính thức"))
            };
        }

        private static string MapStatusToLabel(string status)
        {
            return status switch
            {
                "Active" => "Đang hiệu lực",
                "Expired" => "Hết hạn",
                "Draft" => "Bản nháp",
                "Terminated" => "Đã chấm dứt",
                "Cancelled" => "Đã hủy",
                _ => status
            };
        }

        private static string MapStatusToColor(string status)
        {
            return status switch
            {
                "Active" => "success",
                "Expired" => "error",
                "Draft" => "warning",
                "Terminated" => "default",
                "Cancelled" => "error",
                _ => "default"
            };
        }

        public async Task<IEnumerable<ContractDto>> GetByEmployeeIdAsync(int employeeId)
        {
            var contracts = await _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .Include(x => x.Employee)
                .Include(x => x.ContractType)
                .Where(x => x.employee_id == employeeId)
                .ToListAsync();

            return contracts.Select(x => new ContractDto
            {
                Id = x.Id,
                EmployeeId = x.employee_id,
                EmployeeName = x.Employee?.full_name,
                ContractNumber = x.contract_number,
                ContractTypeId = x.contract_type_id,
                ContractTypeName = x.ContractType?.name,
                SignDate = x.sign_date,
                EffectiveDate = x.effective_date,
                ExpiryDate = x.expiry_date,
                SignedBy = x.signed_by,
                TaxType = x.tax_type,
                Attachment = x.attachment,
                Status = x.status
            }).OrderByDescending(c => c.EffectiveDate);
        }

        public async Task<ContractDto> GetByIdAsync(int id)
        {
            var x = await _unitOfWork.Repository<Entities.Models.Contracts>()
                .AsQueryable()
                .Include(c => c.Employee)
                .Include(c => c.ContractType)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (x == null) return null;

            return new ContractDto
            {
                Id = x.Id,
                EmployeeId = x.employee_id,
                EmployeeName = x.Employee?.full_name,
                ContractNumber = x.contract_number,
                ContractTypeId = x.contract_type_id,
                ContractTypeName = x.ContractType?.name,
                SignDate = x.sign_date,
                EffectiveDate = x.effective_date,
                ExpiryDate = x.expiry_date,
                SignedBy = x.signed_by,
                TaxType = x.tax_type,
                Attachment = x.attachment,
                Status = x.status
            };
        }

        public async Task<bool> CreateAsync(ContractCreateDto dto)
        {
            // 1. Validation: Overlapping dates
            if (await CheckOverlappingContractAsync(dto.EmployeeId, dto.EffectiveDate ?? DateTime.UtcNow, dto.ExpiryDate))
            {
                throw new Exception("Nhân viên này đã có hợp đồng khác hiệu lực trong khoảng thời gian này.");
            }

            var contract = new Entities.Models.Contracts
            {
                employee_id = dto.EmployeeId,
                contract_number = dto.ContractNumber,
                contract_type_id = dto.ContractTypeId,
                sign_date = dto.SignDate,
                effective_date = dto.EffectiveDate,
                expiry_date = dto.ExpiryDate,
                signed_by = dto.SignedBy,
                tax_type = dto.TaxType,
                attachment = dto.Attachment,
                status = dto.Status ?? "Draft"
            };

            await _unitOfWork.Repository<Entities.Models.Contracts>().AddAsync(contract);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        private async Task<bool> CheckOverlappingContractAsync(int employeeId, DateTime startDate, DateTime? endDate, int? excludeContractId = null)
        {
            var contracts = await _unitOfWork.Repository<Entities.Models.Contracts>().FindAsync(c => 
                c.employee_id == employeeId && 
                c.status != "Terminated" && // Ignore terminated contracts
                c.status != "Cancelled" &&
                (!excludeContractId.HasValue || c.Id != excludeContractId.Value));

            foreach (var c in contracts)
            {
                // Condition for overlap:
                // (StartA <= EndB) and (EndA >= StartB)
                // If End is null, treat it as a very far future date
                DateTime endA = endDate ?? DateTime.MaxValue;
                DateTime endB = c.expiry_date ?? DateTime.MaxValue;

                if (startDate <= endB && endA >= c.effective_date)
                {
                    return true;
                }
            }
            return false;
        }

        public async Task<bool> UpdateAsync(int id, ContractUpdateDto dto)
        {
            var contract = await _unitOfWork.Repository<Entities.Models.Contracts>().GetByIdAsync(id);
            if (contract == null) return false;

            // 1. Validation: Overlapping dates
            DateTime newStartDate = dto.EffectiveDate ?? contract.effective_date ?? DateTime.UtcNow;
            DateTime? newEndDate = dto.ExpiryDate ?? contract.expiry_date;
            
            if (await CheckOverlappingContractAsync(contract.employee_id, newStartDate, newEndDate, id))
            {
                throw new Exception("Cập nhật thất bại: Khoảng thời gian hiệu lực mới bị chồng chéo với hợp đồng khác.");
            }

            contract.contract_number = dto.ContractNumber;
            contract.contract_type_id = dto.ContractTypeId;
            contract.sign_date = dto.SignDate;
            contract.effective_date = dto.EffectiveDate;
            contract.expiry_date = dto.ExpiryDate;
            contract.signed_by = dto.SignedBy;
            contract.tax_type = dto.TaxType;
            contract.attachment = dto.Attachment;
            contract.status = dto.Status;

            _unitOfWork.Repository<Entities.Models.Contracts>().Update(contract);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var contract = await _unitOfWork.Repository<Entities.Models.Contracts>().GetByIdAsync(id);
            if (contract == null) return false;

            _unitOfWork.Repository<Entities.Models.Contracts>().Remove(contract);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }
    }
}
