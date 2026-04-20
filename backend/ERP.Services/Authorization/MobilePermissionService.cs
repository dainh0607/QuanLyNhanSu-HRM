using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.Authorization;
using ERP.Entities;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.Authorization
{
    public class MobilePermissionService : IMobilePermissionService
    {
        private readonly IUnitOfWork _uow;
        private readonly AppDbContext _context;

        public MobilePermissionService(IUnitOfWork uow, AppDbContext context)
        {
            _uow = uow;
            _context = context;
        }

        public async Task<List<MobilePermissionNodeDto>> GetEmployeePermissionsAsync(int employeeId)
        {
            await EnsureManifestSeededAsync();

            var manifest = await _context.MobilePermissionManifest
                .OrderBy(m => m.display_order)
                .ToListAsync();

            var employeePermissions = await _context.EmployeeMobilePermissions
                .Where(p => p.employee_id == employeeId)
                .ToDictionaryAsync(p => p.mobile_permission_id, p => p.is_allowed);

            // If no permissions exist for employee, return defaults
            if (!employeePermissions.Any())
            {
                return await GetDefaultPermissionsAsync(employeeId);
            }

            return BuildTree(manifest, employeePermissions);
        }

        public async Task<List<MobilePermissionNodeDto>> GetDefaultPermissionsAsync(int employeeId)
        {
            await EnsureManifestSeededAsync();

            var manifest = await _context.MobilePermissionManifest
                .OrderBy(m => m.display_order)
                .ToListAsync();

            var employee = await _context.Employees
                .Include(e => e.JobTitle)
                .FirstOrDefaultAsync(e => e.Id == employeeId);

            // Logic mặc định: 
            // Nếu là Manager/Admin (dựa trên JobTitle code hoặc Role) -> Cho phép hết
            // Nếu là Staff -> Chỉ cho phép một số module cơ bản
            bool isManager = employee?.JobTitle?.code?.Contains("MGR") == true || employee?.JobTitle?.code?.Contains("DIR") == true;

            var defaultAllowed = new Dictionary<int, bool>();
            foreach (var item in manifest)
            {
                if (isManager)
                {
                    defaultAllowed[item.Id] = true;
                }
                else
                {
                    // Cơ bản cho nhân viên
                    defaultAllowed[item.Id] = item.code == "NOTI" || item.code == "ATTENDANCE" || item.code == "CALENDAR";
                }
            }

            return BuildTree(manifest, defaultAllowed);
        }

        public async Task<bool> UpdatePermissionsAsync(int employeeId, List<int> allowedPermissionIds)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();
            try
            {
                // Xóa cũ
                var old = await _context.EmployeeMobilePermissions
                    .Where(p => p.employee_id == employeeId)
                    .ToListAsync();
                _context.EmployeeMobilePermissions.RemoveRange(old);

                // Thêm mới
                var tenantId = _context.Employees.Where(e => e.Id == employeeId).Select(e => e.tenant_id).FirstOrDefault();
                
                foreach (var id in allowedPermissionIds)
                {
                    _context.EmployeeMobilePermissions.Add(new EmployeeMobilePermissions
                    {
                        employee_id = employeeId,
                        mobile_permission_id = id,
                        is_allowed = true,
                        tenant_id = tenantId,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow
                    });
                }

                await _uow.SaveChangesAsync();
                await transaction.CommitAsync();
                return true;
            }
            catch (Exception)
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        private List<MobilePermissionNodeDto> BuildTree(List<MobilePermissionManifest> manifest, Dictionary<int, bool> status)
        {
            var nodes = manifest.Select(m => new MobilePermissionNodeDto
            {
                Id = m.Id,
                Code = m.code,
                Name = m.name,
                IsModule = m.is_module,
                IsAllowed = status.ContainsKey(m.Id) && status[m.Id],
                Children = new List<MobilePermissionNodeDto>()
            }).ToDictionary(n => n.Id);

            var rootNodes = new List<MobilePermissionNodeDto>();

            foreach (var m in manifest)
            {
                if (m.parent_id.HasValue && nodes.ContainsKey(m.parent_id.Value))
                {
                    nodes[m.parent_id.Value].Children.Add(nodes[m.Id]);
                }
                else
                {
                    rootNodes.Add(nodes[m.Id]);
                }
            }

            return rootNodes;
        }

        private async Task EnsureManifestSeededAsync()
        {
            if (await _context.MobilePermissionManifest.AnyAsync()) return;

            // Seed dữ liệu mẫu từ User Story
            var modules = new[]
            {
                (Code: "NOTI", Name: "Thông báo", Order: 1),
                (Code: "TASK", Name: "Giao việc", Order: 2),
                (Code: "WORK", Name: "Làm việc", Order: 3),
                (Code: "EMP", Name: "Nhân viên", Order: 4),
                (Code: "CALENDAR", Name: "Lịch", Order: 5),
                (Code: "TRAINING", Name: "Đào tạo trực tuyến", Order: 6)
            };

            foreach (var m in modules)
            {
                var module = new MobilePermissionManifest { code = m.Code, name = m.Name, is_module = true, display_order = m.Order };
                _context.MobilePermissionManifest.Add(module);
                await _uow.SaveChangesAsync();

                // Các feature con mẫu
                if (m.Code == "WORK")
                {
                    _context.MobilePermissionManifest.Add(new MobilePermissionManifest { parent_id = module.Id, code = "REQUEST", name = "Quản lý yêu cầu", is_module = false, display_order = 1 });
                    _context.MobilePermissionManifest.Add(new MobilePermissionManifest { parent_id = module.Id, code = "ATTENDANCE", name = "Chấm công", is_module = false, display_order = 2 });
                    _context.MobilePermissionManifest.Add(new MobilePermissionManifest { parent_id = module.Id, code = "REPORT", name = "Báo cáo", is_module = false, display_order = 3 });
                }
            }
            await _uow.SaveChangesAsync();
        }
    }
}
