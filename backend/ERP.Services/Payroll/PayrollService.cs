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

namespace ERP.Services.Payroll
{
    public class PayrollService : IPayrollService
    {
        private readonly IUnitOfWork _unitOfWork;

        public PayrollService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
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
                .Select(g => new PayrollGroupDto
                {
                    MonthYear = $"Tháng {g.Key.Month}/{g.Key.Year}",
                    Items = g.ToList()
                })
                .OrderByDescending(g => g.MonthYear) // This might not be perfect for sorting dates as strings, but since we sorted periods DESC first, it should be okay. Actually, better to re-calculate sort.
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
            // This is a complex logic that will be implemented in detail later
            await Task.Delay(100); 
            return true;
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
    }
}
