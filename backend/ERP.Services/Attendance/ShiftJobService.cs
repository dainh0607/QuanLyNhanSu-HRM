using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.DTOs.Attendance;
using ERP.Entities.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Attendance
{
    public class ShiftJobService : IShiftJobService
    {
        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public ShiftJobService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<List<ShiftJobDto>> GetAllAsync()
        {
            var jobs = await _context.ShiftJobs
                .Include(j => j.Branch)
                .Include(j => j.ShiftJobDepartments).ThenInclude(d => d.Department)
                .Include(j => j.ShiftJobEmployees).ThenInclude(e => e.Employee)
                .ToListAsync();

            return jobs.Select(j => MapToDto(j)).ToList();
        }

        public async Task<ShiftJobDto> GetByIdAsync(int id)
        {
            var job = await _context.ShiftJobs
                .Include(j => j.Branch)
                .Include(j => j.ShiftJobDepartments)
                .Include(j => j.ShiftJobEmployees)
                .FirstOrDefaultAsync(j => j.Id == id);

            return job == null ? null : MapToDto(job);
        }

        public async Task<int> CreateAsync(CreateShiftJobDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var job = new ShiftJobs
                {
                    name = dto.name,
                    code = dto.code,
                    branch_id = dto.branch_id,
                    color_code = dto.color_code,
                    is_active = dto.is_active,
                    description = dto.description,
                    tenant_id = _userContext.TenantId
                };

                _context.ShiftJobs.Add(job);
                await _context.SaveChangesAsync();

                if (dto.department_ids?.Any() == true)
                {
                    foreach (var deptId in dto.department_ids)
                    {
                        _context.ShiftJobDepartments.Add(new ShiftJobDepartments
                        {
                            shift_job_id = job.Id,
                            department_id = deptId,
                            tenant_id = _userContext.TenantId
                        });
                    }
                }

                if (dto.employee_ids?.Any() == true)
                {
                    foreach (var empId in dto.employee_ids)
                    {
                        _context.ShiftJobEmployees.Add(new ShiftJobEmployees
                        {
                            shift_job_id = job.Id,
                            employee_id = empId,
                            tenant_id = _userContext.TenantId
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return job.Id;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> UpdateAsync(int id, UpdateShiftJobDto dto)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                var job = await _context.ShiftJobs
                    .Include(j => j.ShiftJobDepartments)
                    .Include(j => j.ShiftJobEmployees)
                    .FirstOrDefaultAsync(j => j.Id == id);

                if (job == null) return false;

                job.name = dto.name;
                job.code = dto.code;
                job.branch_id = dto.branch_id;
                job.color_code = dto.color_code;
                job.is_active = dto.is_active;
                job.description = dto.description;

                // Update Departments
                _context.ShiftJobDepartments.RemoveRange(job.ShiftJobDepartments);
                if (dto.department_ids?.Any() == true)
                {
                    foreach (var deptId in dto.department_ids)
                    {
                        _context.ShiftJobDepartments.Add(new ShiftJobDepartments
                        {
                            shift_job_id = job.Id,
                            department_id = deptId,
                            tenant_id = _userContext.TenantId
                        });
                    }
                }

                // Update Employees
                _context.ShiftJobEmployees.RemoveRange(job.ShiftJobEmployees);
                if (dto.employee_ids?.Any() == true)
                {
                    foreach (var empId in dto.employee_ids)
                    {
                        _context.ShiftJobEmployees.Add(new ShiftJobEmployees
                        {
                            shift_job_id = job.Id,
                            employee_id = empId,
                            tenant_id = _userContext.TenantId
                        });
                    }
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var job = await _context.ShiftJobs.FindAsync(id);
            if (job == null) return false;

            _context.ShiftJobs.Remove(job);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<QuickMatchEmployeesResponseDto> QuickMatchEmployeesAsync(QuickMatchEmployeesRequestDto dto)
        {
            var identifiers = dto.identifiers
                .Select(i => i.Trim())
                .Where(i => !string.IsNullOrEmpty(i))
                .ToList();
                
            if (!identifiers.Any()) return new QuickMatchEmployeesResponseDto();

            var matchedEmployees = await _context.Employees
                .Where(e => identifiers.Contains(e.employee_code) || identifiers.Contains(e.email))
                .Select(e => new MatchedEmployeeDto
                {
                    id = e.Id,
                    employee_code = e.employee_code,
                    full_name = e.full_name,
                    email = e.email
                })
                .ToListAsync();

            var matchedCodes = matchedEmployees.Select(e => e.employee_code).ToList();
            var matchedEmails = matchedEmployees.Select(e => e.email).ToList();

            var unmatched = identifiers
                .Where(i => !matchedCodes.Contains(i, StringComparer.OrdinalIgnoreCase) && 
                           !matchedEmails.Contains(i, StringComparer.OrdinalIgnoreCase))
                .ToList();

            return new QuickMatchEmployeesResponseDto
            {
                matched_employees = matchedEmployees,
                unmatched_identifiers = unmatched
            };
        }

        private ShiftJobDto MapToDto(ShiftJobs job)
        {
            var summaryParts = new List<string>();
            
            if (job.ShiftJobDepartments?.Any() == true)
            {
                var firstDept = job.ShiftJobDepartments.First().Department?.name ?? "N/A";
                var otherCount = job.ShiftJobDepartments.Count - 1;
                summaryParts.Add(otherCount > 0 ? $"{firstDept}, +{otherCount} phòng ban khác" : firstDept);
            }

            if (job.ShiftJobEmployees?.Any() == true)
            {
                var firstEmp = job.ShiftJobEmployees.First().Employee?.full_name ?? "N/A";
                var otherCount = job.ShiftJobEmployees.Count - 1;
                summaryParts.Add(otherCount > 0 ? $"{firstEmp}, +{otherCount} nhân viên khác" : firstEmp);
            }

            return new ShiftJobDto
            {
                id = job.Id,
                name = job.name,
                code = job.code,
                branch_id = job.branch_id,
                branch_name = job.Branch?.name,
                color_code = job.color_code,
                is_active = job.is_active,
                description = job.description,
                department_ids = job.ShiftJobDepartments?.Select(d => d.department_id).ToList() ?? new List<int>(),
                employee_ids = job.ShiftJobEmployees?.Select(e => e.employee_id).ToList() ?? new List<int>(),
                assignment_summary = summaryParts.Any() ? string.Join(" | ", summaryParts) : "Mọi người"
            };
        }
    }
}
