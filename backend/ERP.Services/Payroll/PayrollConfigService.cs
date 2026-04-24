using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Payroll;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Entities.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Payroll
{
    public class PayrollConfigService : IPayrollConfigService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public PayrollConfigService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        // ==================== SALARY GRADES ====================

        public async Task<List<SalaryGradeConfigDto>> GetSalaryGradesAsync(string paymentType)
        {
            return await _context.SalaryGrades
                .Where(g => g.is_active && g.payment_type == paymentType)
                .OrderBy(g => g.name)
                .Select(g => new SalaryGradeConfigDto
                {
                    Id = g.Id,
                    Name = g.name,
                    Amount = g.amount,
                    PaymentType = g.payment_type
                })
                .ToListAsync();
        }

        public async Task<SalaryGradeConfigDto> CreateSalaryGradeAsync(SalaryGradeConfigDto dto)
        {
            if (dto.Amount < 0)
                throw new ArgumentException("Số tiền không được âm");

            var entity = new SalaryGrade
            {
                name = dto.Name,
                amount = dto.Amount,
                payment_type = dto.PaymentType ?? "MONTHLY",
                is_active = true,
                tenant_id = _userContext.TenantId ?? 1
            };

            _context.SalaryGrades.Add(entity);
            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            return dto;
        }

        public async Task<SalaryGradeConfigDto> UpdateSalaryGradeAsync(int id, SalaryGradeConfigDto dto)
        {
            if (dto.Amount < 0)
                throw new ArgumentException("Số tiền không được âm");

            var entity = await _context.SalaryGrades.FindAsync(id);
            if (entity == null) throw new KeyNotFoundException("Không tìm thấy bậc lương");

            entity.name = dto.Name;
            entity.amount = dto.Amount;
            entity.payment_type = dto.PaymentType ?? entity.payment_type;

            await _context.SaveChangesAsync();

            dto.Id = entity.Id;
            return dto;
        }

        public async Task<(bool success, string message)> DeleteSalaryGradeAsync(int id)
        {
            var entity = await _context.SalaryGrades.FindAsync(id);
            if (entity == null)
                return (false, "Không tìm thấy bậc lương");

            // AC 4.2: Check if used in Salaries or VariableSalaries (Contracts)
            var isUsedInSalary = await _context.Salaries.AnyAsync(s => s.salary_grade_id == id);
            var isUsedInVariable = await _context.VariableSalaries.AnyAsync(v => v.salary_grade_id == id);

            if (isUsedInSalary || isUsedInVariable)
            {
                return (false, "Không thể xóa bậc lương này vì đang được sử dụng trong hợp đồng nhân viên. Vui lòng cập nhật hợp đồng trước.");
            }

            _context.SalaryGrades.Remove(entity);
            await _context.SaveChangesAsync();
            return (true, "Xóa thành công");
        }

        // ==================== VARIABLES (Allowance, Advance, Other) ====================

        public async Task<List<PayrollVariableDto>> GetVariablesAsync(string category)
        {
            switch (category)
            {
                case "allowance":
                    return await _context.AllowanceTypes
                        .Where(t => t.is_active)
                        .OrderBy(t => t.display_order)
                        .Select(t => new PayrollVariableDto
                        {
                            Id = t.Id,
                            Name = t.name,
                            Keyword = t.keyword ?? "",
                            DisplayOrder = t.display_order,
                            Category = "allowance"
                        })
                        .ToListAsync();

                case "advance":
                    return await _context.PayrollAdvanceTypes
                        .Where(t => t.is_active)
                        .OrderBy(t => t.display_order)
                        .Select(t => new PayrollVariableDto
                        {
                            Id = t.Id,
                            Name = t.name,
                            Keyword = t.keyword ?? "",
                            DisplayOrder = t.display_order,
                            Category = "advance"
                        })
                        .ToListAsync();

                case "other":
                    return await _context.IncomeTypes
                        .Where(t => t.is_active)
                        .OrderBy(t => t.display_order)
                        .Select(t => new PayrollVariableDto
                        {
                            Id = t.Id,
                            Name = t.name,
                            Keyword = t.keyword ?? "",
                            DisplayOrder = t.display_order,
                            Category = "other"
                        })
                        .ToListAsync();

                default:
                    return new List<PayrollVariableDto>();
            }
        }

        public async Task<PayrollVariableDto> CreateVariableAsync(PayrollVariableDto dto)
        {
            var tenantId = _userContext.TenantId ?? 1;

            // Validate unique keyword per tenant
            var isDuplicate = await CheckKeywordDuplicateAsync(dto.Keyword, dto.Category, null);
            if (isDuplicate)
                throw new InvalidOperationException($"Từ khóa '{dto.Keyword}' đã tồn tại trong hệ thống.");

            switch (dto.Category)
            {
                case "allowance":
                    var allowance = new AllowanceType
                    {
                        name = dto.Name,
                        keyword = dto.Keyword,
                        display_order = dto.DisplayOrder,
                        is_active = true,
                        tenant_id = tenantId
                    };
                    _context.AllowanceTypes.Add(allowance);
                    await _context.SaveChangesAsync();
                    dto.Id = allowance.Id;
                    break;

                case "advance":
                    var advance = new PayrollAdvanceType
                    {
                        name = dto.Name,
                        keyword = dto.Keyword,
                        display_order = dto.DisplayOrder,
                        is_active = true,
                        tenant_id = tenantId
                    };
                    _context.PayrollAdvanceTypes.Add(advance);
                    await _context.SaveChangesAsync();
                    dto.Id = advance.Id;
                    break;

                case "other":
                    var income = new IncomeType
                    {
                        name = dto.Name,
                        keyword = dto.Keyword,
                        display_order = dto.DisplayOrder,
                        is_active = true,
                        tenant_id = tenantId
                    };
                    _context.IncomeTypes.Add(income);
                    await _context.SaveChangesAsync();
                    dto.Id = income.Id;
                    break;

                default:
                    throw new ArgumentException("Loại biến không hợp lệ");
            }

            return dto;
        }

        public async Task<PayrollVariableDto> UpdateVariableAsync(int id, PayrollVariableDto dto)
        {
            // Validate unique keyword per tenant (exclude self)
            var isDuplicate = await CheckKeywordDuplicateAsync(dto.Keyword, dto.Category, id);
            if (isDuplicate)
                throw new InvalidOperationException($"Từ khóa '{dto.Keyword}' đã tồn tại trong hệ thống.");

            switch (dto.Category)
            {
                case "allowance":
                    var allowance = await _context.AllowanceTypes.FindAsync(id);
                    if (allowance == null) throw new KeyNotFoundException("Không tìm thấy loại phụ cấp");
                    allowance.name = dto.Name;
                    allowance.keyword = dto.Keyword;
                    allowance.display_order = dto.DisplayOrder;
                    break;

                case "advance":
                    var advance = await _context.PayrollAdvanceTypes.FindAsync(id);
                    if (advance == null) throw new KeyNotFoundException("Không tìm thấy loại tạm ứng");
                    advance.name = dto.Name;
                    advance.keyword = dto.Keyword;
                    advance.display_order = dto.DisplayOrder;
                    break;

                case "other":
                    var income = await _context.IncomeTypes.FindAsync(id);
                    if (income == null) throw new KeyNotFoundException("Không tìm thấy loại thu nhập");
                    income.name = dto.Name;
                    income.keyword = dto.Keyword;
                    income.display_order = dto.DisplayOrder;
                    break;

                default:
                    throw new ArgumentException("Loại biến không hợp lệ");
            }

            await _context.SaveChangesAsync();
            dto.Id = id;
            return dto;
        }

        public async Task<(bool success, string message)> DeleteVariableAsync(int id, string category)
        {
            switch (category)
            {
                case "allowance":
                    var allowance = await _context.AllowanceTypes.FindAsync(id);
                    if (allowance == null) return (false, "Không tìm thấy loại phụ cấp");

                    // Check if used in employee allowances
                    var isAllowanceUsed = await _context.Allowances.AnyAsync(a => a.allowance_type_id == id);
                    if (isAllowanceUsed)
                        return (false, "Không thể xóa phụ cấp này vì đang được sử dụng trong hợp đồng nhân viên hoặc bảng lương. Bạn chỉ có thể sửa thông tin.");

                    _context.AllowanceTypes.Remove(allowance);
                    break;

                case "advance":
                    var advance = await _context.PayrollAdvanceTypes.FindAsync(id);
                    if (advance == null) return (false, "Không tìm thấy loại tạm ứng");

                    // PayrollAdvanceTypes is new, no FK references yet — safe to delete
                    _context.PayrollAdvanceTypes.Remove(advance);
                    break;

                case "other":
                    var income = await _context.IncomeTypes.FindAsync(id);
                    if (income == null) return (false, "Không tìm thấy loại thu nhập");

                    // Check if used in employee other incomes
                    var isIncomeUsed = await _context.OtherIncomes.AnyAsync(o => o.income_type_id == id);
                    if (isIncomeUsed)
                        return (false, "Không thể xóa loại thu nhập này vì đang được sử dụng trong bảng lương hoặc công thức lương.");

                    _context.IncomeTypes.Remove(income);
                    break;

                default:
                    return (false, "Loại biến không hợp lệ");
            }

            await _context.SaveChangesAsync();
            return (true, "Xóa thành công");
        }

        // ==================== PRIVATE HELPERS ====================

        private async Task<bool> CheckKeywordDuplicateAsync(string keyword, string category, int? excludeId)
        {
            if (string.IsNullOrWhiteSpace(keyword)) return false;

            switch (category)
            {
                case "allowance":
                    return await _context.AllowanceTypes.AnyAsync(t => t.keyword == keyword && (!excludeId.HasValue || t.Id != excludeId.Value));
                case "advance":
                    return await _context.PayrollAdvanceTypes.AnyAsync(t => t.keyword == keyword && (!excludeId.HasValue || t.Id != excludeId.Value));
                case "other":
                    return await _context.IncomeTypes.AnyAsync(t => t.keyword == keyword && (!excludeId.HasValue || t.Id != excludeId.Value));
                default:
                    return false;
            }
        }
    }
}
