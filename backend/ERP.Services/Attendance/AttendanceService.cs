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
                Verified = r.verified,
                Latitude = r.location_lat,
                Longitude = r.location_lng
            });
        }

        public async Task<PaginatedListDto<AttendanceRecordDto>> GetAttendanceHistoryAsync(int employeeId, DateTime? fromDate, DateTime? toDate, int skip, int take)
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

            if (fromDate.HasValue)
            {
                query = query.Where(r => r.record_time >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(r => r.record_time <= toDate.Value);
            }

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
                Verified = r.verified,
                Latitude = r.location_lat,
                Longitude = r.location_lng
            });

            return new PaginatedListDto<AttendanceRecordDto>(items.ToList(), total, skip / take + 1, take);
        }

        public async Task<AttendanceSummaryDto> GetAttendanceSummaryAsync(int employeeId, int month, int year)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var records = await _unitOfWork.Repository<AttendanceRecords>()
                .AsQueryable()
                .Where(r => r.employee_id == employeeId && r.record_time >= startDate && r.record_time < endDate)
                .ToListAsync();

            // Logic đơn giản để tính toán summary
            // Trong thực tế sẽ cần so khớp với ca làm việc để tính Late/Early
            var presentDays = records.Select(r => r.record_time.Date).Distinct().Count();
            var totalDaysInMonth = DateTime.DaysInMonth(year, month);

            return new AttendanceSummaryDto
            {
                EmployeeId = employeeId,
                Month = month,
                Year = year,
                TotalDays = totalDaysInMonth,
                PresentDays = presentDays,
                AbsentDays = totalDaysInMonth - presentDays, // Giả định đơn giản
                LateCount = 0, // Placeholder
                EarlyCount = 0 // Placeholder
            };
        }

        public async Task<IEnumerable<AttendanceRecordDto>> GetMonthlyAttendanceAsync(int employeeId, int month, int year)
        {
            var startDate = new DateTime(year, month, 1);
            var endDate = startDate.AddMonths(1);

            var records = await _unitOfWork.Repository<AttendanceRecords>()
                .AsQueryable()
                .Include(r => r.Employee)
                .Where(r => r.employee_id == employeeId && r.record_time >= startDate && r.record_time < endDate)
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
                Verified = r.verified,
                Latitude = r.location_lat,
                Longitude = r.location_lng
            });
        }

        public async Task<bool> ManualAdjustmentAsync(int modifierId, AttendanceAdjustmentDto dto)
        {
            var record = await _unitOfWork.Repository<AttendanceRecords>().GetByIdAsync(dto.RecordId);
            if (record == null) throw new Exception("Không tìm thấy bản ghi chấm công.");

            // Lưu vết thay đổi
            var modification = new AttendanceModifications
            {
                attendance_record_id = record.Id,
                modified_by = modifierId,
                modified_at = DateTime.UtcNow,
                old_time = record.record_time,
                new_time = dto.NewTime,
                reason = dto.Reason,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            // Cập nhật bản ghi chính
            record.record_time = dto.NewTime;
            record.note = $"[Điều chỉnh] {dto.Reason}";
            record.UpdatedAt = DateTime.UtcNow;

            _unitOfWork.Repository<AttendanceRecords>().Update(record);
            await _unitOfWork.Repository<AttendanceModifications>().AddAsync(modification);

            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<EmployeeMachineMappingDto>> GetEmployeeMachineMappingsAsync(int employeeId)
        {
            var allMachines = await _unitOfWork.Repository<TimeMachines>().AsQueryable().ToListAsync();
            var existingMappings = await _unitOfWork.Repository<EmployeeTimekeepingMachines>()
                .AsQueryable()
                .Where(m => m.employee_id == employeeId)
                .ToListAsync();

            return allMachines.Select(m => new EmployeeMachineMappingDto
            {
                MachineId = m.Id,
                MachineName = m.machine_name,
                TimekeepingCode = existingMappings.FirstOrDefault(em => em.machine_id == m.Id)?.timekeeping_code
            });
        }

        public async Task<bool> UpdateEmployeeMachineMappingsAsync(int employeeId, List<EmployeeMachineMappingDto> mappings)
        {
            var existingMappings = await _unitOfWork.Repository<EmployeeTimekeepingMachines>()
                .AsQueryable()
                .Where(m => m.employee_id == employeeId)
                .ToListAsync();

            foreach (var mapping in mappings)
            {
                var existing = existingMappings.FirstOrDefault(m => m.machine_id == mapping.MachineId);
                
                if (string.IsNullOrWhiteSpace(mapping.TimekeepingCode))
                {
                    // If code is empty, delete existing mapping
                    if (existing != null)
                    {
                        _unitOfWork.Repository<EmployeeTimekeepingMachines>().Remove(existing);
                    }
                }
                else
                {
                    // If code exists, Upsert
                    if (existing != null)
                    {
                        existing.timekeeping_code = mapping.TimekeepingCode;
                        existing.UpdatedAt = DateTime.UtcNow;
                        _unitOfWork.Repository<EmployeeTimekeepingMachines>().Update(existing);
                    }
                    else
                    {
                        var newMapping = new EmployeeTimekeepingMachines
                        {
                            employee_id = employeeId,
                            machine_id = mapping.MachineId,
                            timekeeping_code = mapping.TimekeepingCode,
                            tenant_id = _userContext.TenantId,
                            CreatedAt = DateTime.UtcNow,
                            UpdatedAt = DateTime.UtcNow
                        };
                        await _unitOfWork.Repository<EmployeeTimekeepingMachines>().AddAsync(newMapping);
                    }
                }
            }

            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<EmployeeTimekeepingOptionsDto> GetEmployeeTimekeepingOptionsAsync(int employeeId)
        {
            var settings = await _unitOfWork.Repository<AttendanceSettings>()
                .AsQueryable()
                .FirstOrDefaultAsync(s => s.employee_id == employeeId);

            if (settings == null)
            {
                // Trả về mặc định
                return new EmployeeTimekeepingOptionsDto
                {
                    UnrestrictedLocationOption = "NO_GPS"
                };
            }

            return new EmployeeTimekeepingOptionsDto
            {
                MultiDeviceLogin = settings.multi_device_login,
                TrackLocation = settings.track_location,
                NoAttendance = settings.no_attendance,
                UnrestrictedAttendance = settings.unrestricted_attendance,
                AllowLateInOut = settings.allow_late_in_out,
                AllowEarlyInOut = settings.allow_early_in_out,
                AutoAttendance = settings.auto_attendance,
                AutoCheckout = settings.auto_checkout,
                RequireFaceIn = settings.require_face_in,
                RequireFaceOut = settings.require_face_out,
                ProxyAttendance = settings.proxy_attendance,
                ProxyAttendanceWithImage = settings.proxy_attendance_with_image,
                UnrestrictedLocationOption = settings.unrestricted_location_option ?? "NO_GPS"
            };
        }

        public async Task<bool> UpdateEmployeeTimekeepingOptionsAsync(int employeeId, EmployeeTimekeepingOptionsDto dto)
        {
            var settings = await _unitOfWork.Repository<AttendanceSettings>()
                .AsQueryable()
                .FirstOrDefaultAsync(s => s.employee_id == employeeId);

            if (settings == null)
            {
                settings = new AttendanceSettings
                {
                    employee_id = employeeId,
                    tenant_id = _userContext.TenantId
                };
                await _unitOfWork.Repository<AttendanceSettings>().AddAsync(settings);
            }

            // Sync values
            settings.multi_device_login = dto.MultiDeviceLogin;
            settings.track_location = dto.TrackLocation;
            settings.no_attendance = dto.NoAttendance;
            settings.unrestricted_attendance = dto.UnrestrictedAttendance;
            settings.allow_late_in_out = dto.AllowLateInOut;
            settings.allow_early_in_out = dto.AllowEarlyInOut;
            settings.auto_attendance = dto.AutoAttendance;
            settings.auto_checkout = dto.AutoCheckout;
            settings.require_face_in = dto.RequireFaceIn;
            settings.require_face_out = dto.RequireFaceOut;
            settings.proxy_attendance = dto.ProxyAttendance;
            settings.proxy_attendance_with_image = dto.ProxyAttendanceWithImage;
            settings.unrestricted_location_option = dto.UnrestrictedLocationOption;

            return await _unitOfWork.SaveChangesAsync() > 0;
        }

        public async Task<IEnumerable<EmployeeDeviceDto>> GetEmployeeDevicesAsync(int employeeId)
        {
            var devices = await _unitOfWork.Repository<Devices>()
                .AsQueryable()
                .Where(d => d.employee_id == employeeId)
                .ToListAsync();

            return devices.Select(d => new EmployeeDeviceDto
            {
                Id = d.Id,
                DeviceId = d.imei,
                DeviceName = d.device_name,
                OS = d.os,
                DeviceType = d.device_type,
                LinkedAt = DateTime.MinValue // Placeholder since column missing
            });
        }
    }
}
