using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Payroll;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Globalization;
using ERP.Entities.Interfaces;

namespace ERP.Services.Payroll
{
    public class PayrollService : IPayrollService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserContext _currentUserContext;
        private readonly IPayrollCalculationService _calculationService;

        public PayrollService(
            IUnitOfWork unitOfWork, 
            ICurrentUserContext currentUserContext,
            IPayrollCalculationService calculationService)
        {
            _unitOfWork = unitOfWork;
            _currentUserContext = currentUserContext;
            _calculationService = calculationService;
        }

        public async Task<PayrollPagedResponseDto> GetPayrollTablesAsync(int skip, int take)
        {
            var query = _unitOfWork.Repository<PayrollPeriods>().AsQueryable();
            
            var total = await query.CountAsync();
            
            var periods = await query
                .OrderByDescending(p => p.start_date)
                .Skip(skip)
                .Take(take)
                .Select(p => new PayrollTableDto
                {
                    Id = p.Id,
                    Name = p.name,
                    Departments = p.applicable_departments,
                    Positions = p.applicable_job_titles,
                    EmployeeCount = p.Payrolls.Count(),
                    CreatedAt = p.CreatedAt,
                    Status = p.status,
                    Month = p.start_date.Month,
                    Year = p.start_date.Year
                })
                .ToListAsync();

            var grouped = periods
                .GroupBy(p => new { p.Month, p.Year })
                .OrderByDescending(g => g.Key.Year)
                .ThenByDescending(g => g.Key.Month)
                .Select(g => new PayrollGroupDto
                {
                    MonthYear = $"Tháng {g.Key.Month}/{g.Key.Year}",
                    Items = g.ToList()
                })
                .ToList();

            return new PayrollPagedResponseDto
            {
                Total = total,
                Data = grouped
            };
        }

        public async Task<PaginatedListDto<object>> GetPayrollsAsync(int month, int year, int skip, int take)
        {
            var query = _unitOfWork.Repository<Payrolls>().AsQueryable()
                .Include(p => p.Employee)
                .Include(p => p.Period)
                .Where(p => p.Period.start_date.Month == month && p.Period.start_date.Year == year);

            var total = await query.CountAsync();
            var items = await query.OrderBy(p => p.Employee.full_name)
                .Skip(skip)
                .Take(take)
                .Select(p => new
                {
                    p.Id,
                    EmployeeId = p.employee_id,
                    EmployeeName = p.Employee.full_name,
                    p.base_salary,
                    p.total_allowances,
                    p.total_deductions,
                    p.net_salary,
                    p.status
                })
                .ToListAsync();

            var pageNumber = (skip / take) + 1;
            return new PaginatedListDto<object>(items.Cast<object>().ToList(), total, pageNumber, take);
        }

        public async Task<PaginatedListDto<object>> GetPayrollsByPeriodAsync(int periodId, int skip, int take)
        {
            var query = _unitOfWork.Repository<Payrolls>().AsQueryable()
                .Include(p => p.Employee)
                .Where(p => p.period_id == periodId);

            var total = await query.CountAsync();
            var items = await query.OrderBy(p => p.Employee.full_name)
                .Skip(skip)
                .Take(take)
                .Select(p => new
                {
                    p.Id,
                    EmployeeId = p.employee_id,
                    EmployeeCode = p.Employee.employee_code,
                    EmployeeName = p.Employee.full_name,
                    p.base_salary,
                    p.total_allowances,
                    p.total_deductions,
                    p.net_salary,
                    p.status
                })
                .ToListAsync();

            var pageNumber = (skip / take) + 1;
            return new PaginatedListDto<object>(items.Cast<object>().ToList(), total, pageNumber, take);
        }

        public async Task<object?> GetPayrollDetailAsync(int payrollId)
        {
            var payroll = await _unitOfWork.Repository<Payrolls>().AsQueryable()
                .Include(p => p.Employee)
                    .ThenInclude(e => e.JobTitle)
                .Include(p => p.Employee)
                    .ThenInclude(e => e.Department)
                .Include(p => p.Period)
                .FirstOrDefaultAsync(p => p.Id == payrollId);

            if (payroll == null) return null;

            var details = await _unitOfWork.Repository<PayrollDetails>().AsQueryable()
                .Where(d => d.payroll_id == payrollId)
                .ToListAsync();

            return new
            {
                payroll.Id,
                Employee = new
                {
                    payroll.Employee.Id,
                    payroll.Employee.full_name,
                    payroll.Employee.employee_code,
                    Department = payroll.Employee.Department?.name,
                    JobTitle = payroll.Employee.JobTitle?.name
                },
                Period = $"{payroll.Period.start_date.Month}/{payroll.Period.start_date.Year}",
                payroll.base_salary,
                payroll.total_allowances,
                payroll.total_deductions,
                payroll.net_salary,
                payroll.status,
                Components = details.Select(d => new
                {
                    d.component_name,
                    d.amount,
                    d.component_type // Earning / Deduction
                })
            };
        }

        public async Task<bool> GeneratePayrollsAsync(int month, int year)
        {
            // Logic to calculate payroll for all active employees
            await Task.Delay(100); 
            return true;
        }

        public async Task<bool> CalculatePeriodAsync(int periodId)
        {
            var period = await _unitOfWork.Repository<PayrollPeriods>()
                .AsQueryable()
                .Include(p => p.PayrollType)
                .FirstOrDefaultAsync(p => p.Id == periodId);

            if (period == null || period.PayrollType == null) return false;
            if (string.IsNullOrEmpty(period.PayrollType.formula)) return false;

            var payrolls = await _unitOfWork.Repository<Payrolls>()
                .AsQueryable()
                .Where(p => p.period_id == periodId)
                .ToListAsync();

            foreach (var payroll in payrolls)
            {
                var netSalary = await _calculationService.CalculateSalaryAsync(
                    payroll.employee_id, 
                    periodId, 
                    period.PayrollType.formula
                );

                payroll.net_salary = netSalary;
                payroll.base_salary = netSalary; // Placeholder, real logic would split this
                
                _unitOfWork.Repository<Payrolls>().Update(payroll);
            }

            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<int> CreatePayrollAsync(CreatePayrollRequestDto request)
        {
            DateTime startDate, endDate;

            if (request.TimeType == "FULL_MONTH")
            {
                startDate = new DateTime(request.Year, request.Month, 1);
                endDate = startDate.AddMonths(1).AddDays(-1);
            }
            else
            {
                if (!request.StartDate.HasValue || !request.EndDate.HasValue)
                    throw new Exception("Vui lòng chọn đầy đủ từ ngày và đến ngày");

                if (request.StartDate > request.EndDate)
                    throw new Exception("Từ ngày không được lớn hơn đến ngày");

                startDate = request.StartDate.Value;
                endDate = request.EndDate.Value;
            }

            var payrollType = await _unitOfWork.Repository<PayrollTypes>().GetByIdAsync(request.PayrollTypeId);
            
            var period = new PayrollPeriods
            {
                name = request.Name,
                code = request.Code,
                payroll_type_id = request.PayrollTypeId,
                time_type = request.TimeType,
                is_hidden = request.IsHidden,
                start_date = startDate,
                end_date = endDate,
                status = "Draft",
                applicable_departments = payrollType?.applicable_departments ?? "[]",
                applicable_job_titles = payrollType?.applicable_job_titles ?? "[]",
                tenant_id = _currentUserContext.TenantId ?? 1
            };

            await _unitOfWork.Repository<PayrollPeriods>().AddAsync(period);
            await _unitOfWork.SaveChangesAsync();

            // --- AUTOMATICALLY ADD ELIGIBLE EMPLOYEES ---
            
            // 1. Get all active employees for this tenant
            var employeeQuery = _unitOfWork.Repository<ERP.Entities.Models.Employees>()
                .AsQueryable()
                .Where(e => e.tenant_id == period.tenant_id && e.is_active);

            // 2. Parse filters (Safe Deserialization)
            var deptIds = SafeDeserializeIds(period.applicable_departments);
            var jobIds = SafeDeserializeIds(period.applicable_job_titles);
            var branchIds = payrollType != null ? SafeDeserializeIds(payrollType.applicable_branches) : new List<int>();
            var specificEmpIds = payrollType != null ? SafeDeserializeIds(payrollType.applicable_employees) : new List<int>();

            // 3. Apply Filtering Logic
            List<ERP.Entities.Models.Employees> eligibleEmployees;

            if (specificEmpIds.Any())
            {
                // If specific employees are defined, use only them
                eligibleEmployees = await employeeQuery
                    .Where(e => specificEmpIds.Contains(e.Id))
                    .ToListAsync();
            }
            else
            {
                // Filter by Dept, Job Title, and Branch
                if (deptIds.Any()) employeeQuery = employeeQuery.Where(e => deptIds.Contains(e.department_id ?? 0));
                if (jobIds.Any()) employeeQuery = employeeQuery.Where(e => jobIds.Contains(e.job_title_id ?? 0));
                if (branchIds.Any()) employeeQuery = employeeQuery.Where(e => branchIds.Contains(e.branch_id ?? 0));

                eligibleEmployees = await employeeQuery.ToListAsync();
            }

            // 4. Create Payroll records for each eligible employee
            if (eligibleEmployees.Any())
            {
                var payrolls = eligibleEmployees.Select(emp => new Payrolls
                {
                    period_id = period.Id,
                    employee_id = emp.Id,
                    tenant_id = period.tenant_id,
                    base_salary = 0,
                    total_allowances = 0,
                    total_deductions = 0,
                    net_salary = 0,
                    status = "Draft",
                    note = "" // Mandatory column in DB
                }).ToList();

                foreach (var p in payrolls)
                {
                    await _unitOfWork.Repository<Payrolls>().AddAsync(p);
                }
                
                await _unitOfWork.SaveChangesAsync();
            }

            return period.Id;
        }

        public async Task<PaginatedListDto<PayrollTypeDto>> GetPayrollTypesAsync(int skip, int take)
        {
            var query = _unitOfWork.Repository<PayrollTypes>()
                .AsQueryable()
                .Where(t => t.is_active);

            var total = await query.CountAsync();
            var items = await query
                .OrderBy(t => t.name)
                .Skip(skip)
                .Take(take)
                .Select(t => new PayrollTypeDto
                {
                    Id = t.Id,
                    Name = t.name,
                    Code = t.code,
                    Description = t.description,
                    PaymentType = t.payment_type,
                    ApplicableBranches = t.applicable_branches,
                    ApplicableDepartments = t.applicable_departments,
                    ApplicableJobTitles = t.applicable_job_titles,
                    ApplicableEmployees = t.applicable_employees,
                    ViewerPermissions = t.viewer_permissions
                })
                .ToListAsync();

            return new PaginatedListDto<PayrollTypeDto>(items, total, (skip / take) + 1, take);
        }

        public async Task<int> CreatePayrollTypeAsync(PayrollTypeDto dto)
        {
            var entity = new PayrollTypes
            {
                name = dto.Name,
                code = dto.Code,
                description = dto.Description,
                payment_type = dto.PaymentType ?? "MONTHLY",
                applicable_branches = dto.ApplicableBranches ?? "[]",
                applicable_departments = dto.ApplicableDepartments ?? "[]",
                applicable_job_titles = dto.ApplicableJobTitles ?? "[]",
                applicable_employees = dto.ApplicableEmployees ?? "[]",
                viewer_permissions = dto.ViewerPermissions ?? "[]",
                is_active = true,
                tenant_id = _currentUserContext.TenantId ?? 1
            };

            await _unitOfWork.Repository<PayrollTypes>().AddAsync(entity);
            await _unitOfWork.SaveChangesAsync();
            return entity.Id;
        }

        public async Task<bool> DeletePayrollTypeAsync(int id)
        {
            // Check if used in PayrollPeriods
            var isUsed = await _unitOfWork.Repository<PayrollPeriods>()
                .AsQueryable()
                .AnyAsync(p => p.payroll_type_id == id);

            if (isUsed)
                throw new Exception("Dữ liệu đang được sử dụng, không thể xóa.");

            var type = await _unitOfWork.Repository<PayrollTypes>().GetByIdAsync(id);
            if (type == null) return false;

            _unitOfWork.Repository<PayrollTypes>().Remove(type);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> ApprovePayrollAsync(int payrollId, int approvedBy)
        {
            var payroll = await _unitOfWork.Repository<Payrolls>().GetByIdAsync(payrollId);
            if (payroll == null) return false;

            payroll.status = "Approved";
            payroll.approved_by = approvedBy;
            payroll.approved_at = DateTime.UtcNow;

            _unitOfWork.Repository<Payrolls>().Update(payroll);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeletePayrollTableAsync(int periodId)
        {
            var period = await _unitOfWork.Repository<PayrollPeriods>().AsQueryable()
                .Include(p => p.Payrolls)
                .FirstOrDefaultAsync(p => p.Id == periodId);

            if (period == null) return false;

            // Only allow deleting Draft payrolls (or if there's no specific status yet, we might allow it)
            if (period.status != "Draft" && !string.IsNullOrEmpty(period.status))
            {
                throw new InvalidOperationException("Chỉ có thể xóa bảng lương ở trạng thái Bản nháp.");
            }

            // Delete associated records
            foreach (var payroll in period.Payrolls)
            {
                var details = await _unitOfWork.Repository<PayrollDetails>().AsQueryable()
                    .Where(d => d.payroll_id == payroll.Id)
                    .ToListAsync();
                
                _unitOfWork.Repository<PayrollDetails>().RemoveRange(details);
                _unitOfWork.Repository<Payrolls>().Remove(payroll);
            }

            _unitOfWork.Repository<PayrollPeriods>().Remove(period);
            await _unitOfWork.SaveChangesAsync();
            return true;
        }
        private List<int> SafeDeserializeIds(string json)
        {
            if (string.IsNullOrEmpty(json) || json == "[]") return new List<int>();
            try
            {
                return System.Text.Json.JsonSerializer.Deserialize<List<int>>(json) ?? new List<int>();
            }
            catch
            {
                // If it's old format like ["Name1", "Name2"], it will fail to int. 
                // Return empty so the system doesn't crash.
                return new List<int>();
            }
        }
    }
}
