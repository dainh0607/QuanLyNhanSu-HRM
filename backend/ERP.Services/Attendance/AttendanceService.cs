using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs;
using ERP.DTOs.Attendance;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using ERP.Services.Authorization;
using ERP.Entities.Interfaces;

namespace ERP.Services.Attendance
{
    public class AttendanceService : IAttendanceService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<AttendanceService> _logger;
        private readonly IAuthorizationService _authService;
        private readonly ICurrentUserContext _userContext;

        public AttendanceService(IUnitOfWork unitOfWork, 
            ILogger<AttendanceService> logger,
            IAuthorizationService authService,
            ICurrentUserContext userContext)
        {
            _unitOfWork = unitOfWork;
            _logger = logger;
            _authService = authService;
            _userContext = userContext;
        }

        public async Task<bool> CheckInAsync(int userId, AttendanceCheckInDto dto)
        {
            var user = await _unitOfWork.Repository<Users>().GetByIdAsync(userId);
            if (user == null) throw new Exception("Không tìm thấy thông tin người dùng.");

            var record = new AttendanceRecords
            {
                employee_id = user.employee_id,
                record_time = DateTime.UtcNow,
                record_type = "IN",
                location_lat = dto.Latitude,
                location_lng = dto.Longitude,
                note = dto.Note ?? "Check-in từ Web/Mobile",
                source = "Web",
                verified = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<AttendanceRecords>().AddAsync(record);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<bool> CheckOutAsync(int userId, AttendanceCheckInDto dto)
        {
            var user = await _unitOfWork.Repository<Users>().GetByIdAsync(userId);
            if (user == null) throw new Exception("Không tìm thấy thông tin người dùng.");

            var record = new AttendanceRecords
            {
                employee_id = user.employee_id,
                record_time = DateTime.UtcNow,
                record_type = "OUT",
                location_lat = dto.Latitude,
                location_lng = dto.Longitude,
                note = dto.Note ?? "Check-out từ Web/Mobile",
                source = "Web",
                verified = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            await _unitOfWork.Repository<AttendanceRecords>().AddAsync(record);
            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<AttendanceRecordDto>> GetTodayAttendanceAsync(int employeeId)
        {
            // SCOPING: Check if current user can access this employee
            var currentUserId = _userContext.UserId ?? 0;
            if (currentUserId > 0)
            {
                var canAccess = await _authService.CanAccessEmployee(currentUserId, employeeId);
                if (!canAccess && currentUserId != (await _unitOfWork.Repository<Users>().AsQueryable().Where(u => u.employee_id == employeeId).Select(u => u.Id).FirstOrDefaultAsync()))
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền xem dữ liệu chấm công của nhân viên này.");
                }
            }

            var today = DateTime.UtcNow.Date;
            var tomorrow = today.AddDays(1);

            var records = await _unitOfWork.Repository<AttendanceRecords>()
                .AsQueryable()
                .Include(r => r.Employee)
                .Where(r => r.employee_id == employeeId && r.record_time >= today && r.record_time < tomorrow)
                .OrderBy(r => r.record_time)
                .ToListAsync();

            return records.Select(r => new AttendanceRecordDto
            {
                Id = r.Id,
                EmployeeId = r.employee_id,
                EmployeeName = r.Employee?.full_name,
                RecordTime = r.record_time,
                RecordType = r.record_type,
                Source = r.source,
                Note = r.note,
                Verified = r.verified
            });
        }

        public async Task<PaginatedListDto<AttendanceRecordDto>> GetAttendanceHistoryAsync(int employeeId, int skip, int take)
        {
            // SCOPING: Check if current user can access this employee
            var currentUserId = _userContext.UserId ?? 0;
            if (currentUserId > 0)
            {
                var canAccess = await _authService.CanAccessEmployee(currentUserId, employeeId);
                if (!canAccess && currentUserId != (await _unitOfWork.Repository<Users>().AsQueryable().Where(u => u.employee_id == employeeId).Select(u => u.Id).FirstOrDefaultAsync()))
                {
                    throw new UnauthorizedAccessException("Bạn không có quyền xem lịch sử chấm công của nhân viên này.");
                }
            }

            var query = _unitOfWork.Repository<AttendanceRecords>()
                .AsQueryable()
                .Include(r => r.Employee)
                .Where(r => r.employee_id == employeeId);

            var total = await query.CountAsync();
            var records = await query
                .OrderByDescending(r => r.record_time)
                .Skip(skip)
                .Take(take)
                .ToListAsync();

            var items = records.Select(r => new AttendanceRecordDto
            {
                Id = r.Id,
                EmployeeId = r.employee_id,
                EmployeeName = r.Employee?.full_name,
                RecordTime = r.record_time,
                RecordType = r.record_type,
                Source = r.source,
                Note = r.note,
                Verified = r.verified
            });

            return new PaginatedListDto<AttendanceRecordDto>(items.ToList(), total, skip / take + 1, take);
        }
    }
}
