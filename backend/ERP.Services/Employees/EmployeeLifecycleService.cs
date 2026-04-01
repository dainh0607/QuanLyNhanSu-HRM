using System;
using System.Linq;
using System.Threading.Tasks;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.DTOs.Employees;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace ERP.Services.Employees
{
    public class EmployeeLifecycleService : IEmployeeLifecycleService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<EmployeeLifecycleService> _logger;

        public EmployeeLifecycleService(AppDbContext context, ILogger<EmployeeLifecycleService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<bool> ProcessResignationAsync(int employeeId, ResignationRequestDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Id == employeeId);

                if (employee == null) return false;

                // 1. Update Employee status
                employee.is_resigned = true;
                employee.resignation_reason = dto.Reason;
                employee.is_active = false;
                employee.UpdatedAt = DateTime.UtcNow;

                // 2. Clear sensitive assignments (optional logic, can be expanded)
                // e.g., Set department head to false if they were
                employee.is_department_head = false;

                // 3. Create a Requests record (Auditable parent)
                var request = new Requests
                {
                    request_type_id = 4, // WORK (Close enough for now, ideally REQ_RESIGN)
                    employee_id = employeeId,
                    status = "Approved",
                    created_by = employeeId, // Assumed by self or admin
                    approved_by = null,
                    approved_at = DateTime.UtcNow,
                    note = dto.Note,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.Requests.Add(request);
                await _context.SaveChangesAsync();

                // 4. Create a RequestResignations record for details
                var resignationRecord = new RequestResignations
                {
                    request_id = request.Id,
                    resignation_date = dto.ResignationDate,
                    reason = dto.Reason,
                    handover_employee_id = null
                };

                _context.RequestResignations.Add(resignationRecord);
                
                // 5. Deactivate associated User accounts
                var users = await _context.Users
                    .Where(u => u.employee_id == employeeId)
                    .ToListAsync();
                
                foreach (var user in users)
                {
                    user.is_active = false;
                    user.UpdatedAt = DateTime.UtcNow;
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error processing resignation for employee {EmployeeId}", employeeId);
                return false;
            }
        }

        public async Task<bool> ProcessPromotionAsync(int employeeId, PromotionRequestDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var employee = await _context.Employees
                    .FirstOrDefaultAsync(e => e.Id == employeeId);

                if (employee == null) return false;

                // 1. Create Promotion History Record
                var history = new PromotionHistory
                {
                    employee_id = employeeId,
                    effective_date = dto.EffectiveDate,
                    decision_number = dto.DecisionNumber,
                    branch_id = dto.NewBranchId ?? employee.branch_id,
                    department_id = dto.NewDepartmentId ?? employee.department_id,
                    job_title_id = dto.NewJobTitleId ?? employee.job_title_id,
                    salary_amount = dto.NewSalaryAmount,
                    note = dto.Note,
                    // Remove CreatedAt/UpdatedAt as they are not on BaseEntity
                    // These fields are required in the entity
                    work_status = "Active",
                    payment_method = "Bank Transfer",
                    city = "",
                    district = "",
                    allowance = "{}",
                    other_income = "{}"
                };

                _context.PromotionHistory.Add(history);

                // 2. Update Employee current state
                if (dto.NewBranchId.HasValue) employee.branch_id = dto.NewBranchId.Value;
                if (dto.NewDepartmentId.HasValue) employee.department_id = dto.NewDepartmentId.Value;
                if (dto.NewJobTitleId.HasValue) employee.job_title_id = dto.NewJobTitleId.Value;
                
                employee.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error processing promotion for employee {EmployeeId}", employeeId);
                return false;
            }
        }
    }
}
