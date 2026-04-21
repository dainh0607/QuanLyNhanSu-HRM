using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Employees;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using ClosedXML.Excel;
using System.IO;

namespace ERP.Services.Employees
{
    public class EmploymentHistoryService : IEmploymentHistoryService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly AppDbContext _context;

        public EmploymentHistoryService(IUnitOfWork unitOfWork, AppDbContext context)
        {
            _unitOfWork = unitOfWork;
            _context = context;
        }

        public async Task<PaginatedListDto<EmploymentHistoryLogDto>> GetPagedListAsync(EmploymentHistoryFilterDto filter)
        {
            var query = _context.EmploymentHistoryLogs
                .Include(x => x.Employee)
                .Include(x => x.DecisionType)
                .Include(x => x.ContractType)
                .Include(x => x.Province)
                .Include(x => x.District)
                .AsQueryable();

            if (filter.EmployeeId.HasValue)
                query = query.Where(x => x.employee_id == filter.EmployeeId.Value);

            if (!string.IsNullOrEmpty(filter.ChangeType) && filter.ChangeType != "Tất cả")
                query = query.Where(x => x.change_type == filter.ChangeType);

            if (filter.FromDate.HasValue)
                query = query.Where(x => x.effective_date >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(x => x.effective_date <= filter.ToDate.Value);

            if (filter.BranchId.HasValue)
                query = query.Where(x => x.Employee.branch_id == filter.BranchId.Value);

            if (filter.DepartmentId.HasValue)
                query = query.Where(x => x.Employee.department_id == filter.DepartmentId.Value);

            var count = await query.CountAsync();
            var items = await query
                .OrderByDescending(x => x.effective_date)
                .ThenByDescending(x => x.CreatedAt)
                .Skip((filter.PageNumber - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var dtos = items.Select(x => MapToDto(x)).ToList();

            return new PaginatedListDto<EmploymentHistoryLogDto>(dtos, count, filter.PageNumber, filter.PageSize);
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var log = await _context.EmploymentHistoryLogs.FindAsync(id);
            if (log == null) return false;

            _context.EmploymentHistoryLogs.Remove(log);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<bool> BulkDeleteAsync(int[] ids)
        {
            if (ids == null || ids.Length == 0) return false;

            var logs = await _context.EmploymentHistoryLogs
                .Where(x => ids.Contains(x.Id))
                .ToListAsync();

            if (!logs.Any()) return false;

            _context.EmploymentHistoryLogs.RemoveRange(logs);
            return await _context.SaveChangesAsync() > 0;
        }

        public async Task<byte[]> ExportExcelAsync(EmploymentHistoryFilterDto filter)
        {
            // Reuse the filtering logic (without pagination)
            var query = _context.EmploymentHistoryLogs
                .Include(x => x.Employee)
                .Include(x => x.DecisionType)
                .Include(x => x.ContractType)
                .Include(x => x.Province)
                .Include(x => x.District)
                .AsQueryable();

            if (filter.EmployeeId.HasValue)
                query = query.Where(x => x.employee_id == filter.EmployeeId.Value);
            
            if (filter.SelectedIds != null && filter.SelectedIds.Any())
                query = query.Where(x => filter.SelectedIds.Contains(x.Id));

            if (!string.IsNullOrEmpty(filter.ChangeType) && filter.ChangeType != "Tất cả")
                query = query.Where(x => x.change_type == filter.ChangeType);

            if (filter.FromDate.HasValue)
                query = query.Where(x => x.effective_date >= filter.FromDate.Value);

            if (filter.ToDate.HasValue)
                query = query.Where(x => x.effective_date <= filter.ToDate.Value);

            var items = await query
                .OrderByDescending(x => x.effective_date)
                .ToListAsync();

            using (var workbook = new XLWorkbook())
            {
                var worksheet = workbook.Worksheets.Add("Lịch sử biến động");
                
                // Headers
                worksheet.Cell(1, 1).Value = "Ngày có hiệu lực";
                worksheet.Cell(1, 2).Value = "Loại quyết định";
                worksheet.Cell(1, 3).Value = "Loại HĐ/PLHĐ";
                worksheet.Cell(1, 4).Value = "Số QĐ/HĐ";
                worksheet.Cell(1, 5).Value = "Tình trạng công việc";
                worksheet.Cell(1, 6).Value = "Tỉnh/Thành phố";
                worksheet.Cell(1, 7).Value = "Quận/Huyện";
                worksheet.Cell(1, 8).Value = "Loại biến động";
                worksheet.Cell(1, 9).Value = "Ghi chú";

                // Format header
                var headerRange = worksheet.Range(1, 1, 1, 9);
                headerRange.Style.Font.Bold = true;
                headerRange.Style.Fill.BackgroundColor = XLColor.LightGray;

                // Data
                for (int i = 0; i < items.Count; i++)
                {
                    var item = items[i];
                    int row = i + 2;
                    worksheet.Cell(row, 1).Value = item.effective_date.ToString("dd/MM/yyyy");
                    worksheet.Cell(row, 2).Value = item.DecisionType?.name;
                    worksheet.Cell(row, 3).Value = item.ContractType?.name;
                    worksheet.Cell(row, 4).Value = item.decision_number;
                    worksheet.Cell(row, 5).Value = item.work_status;
                    worksheet.Cell(row, 6).Value = item.Province?.name;
                    worksheet.Cell(row, 7).Value = item.District?.name;
                    worksheet.Cell(row, 8).Value = item.change_type;
                    worksheet.Cell(row, 9).Value = item.note;
                }

                worksheet.Columns().AdjustToContents();

                using (var stream = new MemoryStream())
                {
                    workbook.SaveAs(stream);
                    return stream.ToArray();
                }
            }
        }

        public async Task CreateLogAsync(EmploymentHistoryLogDto dto)
        {
            var log = new EmploymentHistoryLog
            {
                employee_id = dto.EmployeeId,
                effective_date = dto.EffectiveDate,
                decision_type_id = dto.DecisionTypeId,
                contract_type_id = dto.ContractTypeId,
                decision_number = dto.DecisionNumber,
                work_status = dto.WorkStatus,
                province_id = dto.ProvinceId,
                district_id = dto.DistrictId,
                change_type = dto.ChangeType,
                note = dto.Note,
                CreatedAt = DateTime.UtcNow
            };

            await _context.EmploymentHistoryLogs.AddAsync(log);
            await _context.SaveChangesAsync();
        }

        private EmploymentHistoryLogDto MapToDto(EmploymentHistoryLog x)
        {
            return new EmploymentHistoryLogDto
            {
                Id = x.Id,
                EmployeeId = x.employee_id,
                EmployeeCode = x.Employee?.employee_code,
                FullName = x.Employee?.full_name,
                EffectiveDate = x.effective_date,
                DecisionTypeId = x.decision_type_id,
                DecisionTypeName = x.DecisionType?.name,
                ContractTypeId = x.contract_type_id,
                ContractTypeName = x.ContractType?.name,
                DecisionNumber = x.decision_number,
                WorkStatus = x.work_status,
                ProvinceId = x.province_id,
                ProvinceName = x.Province?.name,
                DistrictId = x.district_id,
                DistrictName = x.District?.name,
                ChangeType = x.change_type,
                Note = x.note,
                CreatedAt = x.CreatedAt
            };
        }
    }
}
