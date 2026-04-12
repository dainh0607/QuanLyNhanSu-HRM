using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Attendance;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Attendance
{
    public class ShiftAssignmentService : IShiftAssignmentService
    {
        private readonly IUnitOfWork _unitOfWork;

        public ShiftAssignmentService(IUnitOfWork unitOfWork)
        {
            _unitOfWork = unitOfWork;
        }

        public async Task<WeeklyScheduleApiResponseDto> GetWeeklyScheduleAsync(string weekStartDate, int? branchId, int? departmentId, string? searchTerm)
        {
            if (!DateTime.TryParse(weekStartDate, out var startDate))
                throw new Exception("Ngày bắt đầu tuần không hợp lệ.");

            var endDate = startDate.AddDays(7);

            // 1. Fetch Employees
            var employeeQuery = _unitOfWork.Repository<Entities.Models.Employees>()
                .AsQueryable()
                .Include(e => e.Branch)
                .Include(e => e.Department)
                .Include(e => e.JobTitle)
                .Where(e => e.is_active);

            if (branchId.HasValue)
                employeeQuery = employeeQuery.Where(e => e.branch_id == branchId.Value);
            
            if (departmentId.HasValue)
                employeeQuery = employeeQuery.Where(e => e.department_id == departmentId.Value);

            if (!string.IsNullOrEmpty(searchTerm))
                employeeQuery = employeeQuery.Where(e => e.full_name.Contains(searchTerm) || e.employee_code.Contains(searchTerm));

            var employees = await employeeQuery.ToListAsync();
            var employeeIdsList = employees.Select(e => e.Id).ToList();

            // 2. Fetch Assignments
            var assignments = await _unitOfWork.Repository<ShiftAssignments>()
                .AsQueryable()
                .Include(a => a.Shift)
                .Include(a => a.Employee)
                    .ThenInclude(e => e.Branch)
                .Include(a => a.Employee)
                    .ThenInclude(e => e.JobTitle)
                .Where(a => employeeIdsList.Contains(a.employee_id) && a.assignment_date >= startDate && a.assignment_date < endDate)
                .ToListAsync();

            // 3. Fetch Open Shifts
            var openShiftQuery = _unitOfWork.Repository<OpenShifts>()
                .AsQueryable()
                .Include(o => o.Shift)
                .Include(o => o.Branch)
                .Include(o => o.JobTitle)
                .Where(o => o.open_date >= startDate && o.open_date < endDate);

            if (branchId.HasValue)
                openShiftQuery = openShiftQuery.Where(o => o.branch_id == branchId.Value);

            var openShifts = await openShiftQuery.ToListAsync();

            // 4. Transform to DTOs
            return new WeeklyScheduleApiResponseDto
            {
                WeekStartDate = weekStartDate,
                Employees = employees.Select(e => new WeeklyScheduleApiEmployeeDto
                {
                    Id = e.Id,
                    FullName = e.full_name,
                    Avatar = e.avatar,
                    EmployeeCode = e.employee_code,
                    BranchId = e.branch_id,
                    BranchName = e.Branch?.name,
                    DepartmentId = e.department_id,
                    DepartmentName = e.Department?.name,
                    JobTitleId = e.job_title_id,
                    JobTitleName = e.JobTitle?.name,
                    IsActive = e.is_active
                }).ToList(),
                Assignments = assignments.Select(a => new WeeklyScheduleApiAssignmentDto
                {
                    Id = a.Id,
                    EmployeeId = a.employee_id,
                    EmployeeName = a.Employee?.full_name,
                    EmployeeCode = a.Employee?.employee_code,
                    EmployeeAvatar = a.Employee?.avatar,
                    ShiftId = a.shift_id,
                    ShiftName = a.Shift?.shift_name,
                    StartTime = a.Shift?.start_time.ToString(@"hh\:mm"),
                    EndTime = a.Shift?.end_time.ToString(@"hh\:mm"),
                    AssignmentDate = a.assignment_date.ToString("yyyy-MM-dd"),
                    IsPublished = a.is_published,
                    Note = a.note,
                    BranchId = a.Employee?.branch_id,
                    BranchName = a.Employee?.Branch?.name,
                    JobTitleId = a.Employee?.job_title_id,
                    JobTitleName = a.Employee?.JobTitle?.name
                }).ToList(),
                OpenShifts = openShifts.Select(o => new WeeklyScheduleApiOpenShiftDto
                {
                    Id = o.Id,
                    ShiftId = o.shift_id,
                    ShiftName = o.Shift?.shift_name,
                    StartTime = o.Shift?.start_time.ToString(@"hh\:mm"),
                    EndTime = o.Shift?.end_time.ToString(@"hh\:mm"),
                    OpenDate = o.open_date.ToString("yyyy-MM-dd"),
                    Status = o.status,
                    RequiredQuantity = o.required_quantity,
                    AssignedQuantity = 0,
                    BranchId = o.branch_id,
                    BranchName = o.Branch?.name,
                    DepartmentId = o.department_id,
                    JobTitleId = o.job_title_id,
                    JobTitleName = o.JobTitle?.name
                }).ToList(),
                LastUpdatedAt = DateTime.UtcNow
            };
        }
    }
}
