using System;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.ControlPlane;
using ERP.Entities.Models;
using ERP.Entities.Models.ControlPlane;
using EmployeeEntity = ERP.Entities.Models.Employees;
using UserEntity = ERP.Entities.Models.Users;
using ERP.Repositories.Interfaces;
using ERP.Services.Auth;
using Microsoft.EntityFrameworkCore;
using ERP.DTOs.Auth;

namespace ERP.Services.ControlPlane
{
    public class WorkspaceActivationService : IWorkspaceActivationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IAuthService _authService;

        public WorkspaceActivationService(IUnitOfWork unitOfWork, IAuthService authService)
        {
            _unitOfWork = unitOfWork;
            _authService = authService;
        }

        public async Task<WorkspaceActivationResultDto> FetchActivationSessionAsync(string token)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = "not_found",
                    Message = "Token kích hoạt không hợp lệ."
                };
            }

            var invitation = await _unitOfWork.Repository<WorkspaceOwnerInvitation>()
                .AsQueryable()
                .FirstOrDefaultAsync(i => i.ActivationToken == token.Trim());

            if (invitation == null)
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = "not_found",
                    Message = "Liên kết kích hoạt không tồn tại hoặc đã bị thu hồi."
                };
            }

            // Check if expired
            if (invitation.Status == "invited" && invitation.ExpiresAt < DateTime.UtcNow)
            {
                invitation.Status = "expired";
                _unitOfWork.Repository<WorkspaceOwnerInvitation>().Update(invitation);
                await _unitOfWork.SaveChangesAsync();
            }

            var session = MapToSession(invitation);

            return new WorkspaceActivationResultDto
            {
                Success = invitation.Status != "not_found",
                Status = string.Equals(invitation.Status, "invited", StringComparison.OrdinalIgnoreCase) ? "ready" : invitation.Status,
                Session = session,
                Message = string.Equals(invitation.Status, "invited", StringComparison.OrdinalIgnoreCase)
                    ? "Liên kết kích hoạt hợp lệ."
                    : "Liên kết kích hoạt hiện không sẵn sàng để sử dụng."
            };
        }

        public async Task<WorkspaceActivationResultDto> ActivateWorkspaceOwnerAsync(WorkspaceActivationPayloadDto payload)
        {
            if (string.IsNullOrWhiteSpace(payload.Token))
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = "not_found",
                    Message = "Token kích hoạt không hợp lệ."
                };
            }

            if (payload.Password != payload.ConfirmPassword)
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = "ready",
                    Message = "Mật khẩu xác nhận không khớp."
                };
            }

            if (payload.Password.Length < 8)
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = "ready",
                    Message = "Mật khẩu phải có ít nhất 8 ký tự."
                };
            }

            var invitation = await _unitOfWork.Repository<WorkspaceOwnerInvitation>()
                .AsQueryable()
                .FirstOrDefaultAsync(i => i.ActivationToken == payload.Token.Trim());

            if (invitation == null)
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = "not_found",
                    Message = "Liên kết kích hoạt không tồn tại."
                };
            }

            // Check expiration
            if (invitation.Status == "invited" && invitation.ExpiresAt < DateTime.UtcNow)
            {
                invitation.Status = "expired";
                _unitOfWork.Repository<WorkspaceOwnerInvitation>().Update(invitation);
                await _unitOfWork.SaveChangesAsync();
            }

            if (!string.Equals(invitation.Status, "invited", StringComparison.OrdinalIgnoreCase))
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = invitation.Status,
                    Session = MapToSession(invitation),
                    Message = string.Equals(invitation.Status, "activated", StringComparison.OrdinalIgnoreCase)
                        ? "Tài khoản này đã được kích hoạt trước đó."
                        : "Liên kết này hiện không thể sử dụng để kích hoạt tài khoản."
                };
            }

            // Fetch target tenant to link correctly
            var tenant = await _unitOfWork.Repository<Tenants>()
                .AsQueryable()
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(t => t.code == invitation.WorkspaceCode);

            if (tenant == null)
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = "error",
                    Message = $"Workspace '{invitation.WorkspaceCode}' không tồn tại trong hệ thống."
                };
            }

            try
            {
                var normalizedOwnerEmail = invitation.OwnerEmail.Trim().ToLowerInvariant();
                var employeeRepository = _unitOfWork.Repository<EmployeeEntity>();
                var userRepository = _unitOfWork.Repository<UserEntity>();
                var existingEmployee = await employeeRepository
                    .AsQueryable()
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(e =>
                        (!string.IsNullOrWhiteSpace(e.email) && e.email.ToLower() == normalizedOwnerEmail) ||
                        (!string.IsNullOrWhiteSpace(e.work_email) && e.work_email.ToLower() == normalizedOwnerEmail));

                if (existingEmployee != null &&
                    existingEmployee.tenant_id.HasValue &&
                    existingEmployee.tenant_id.Value != tenant.Id)
                {
                    return new WorkspaceActivationResultDto
                    {
                        Success = false,
                        Status = "error",
                        Message = $"Email '{invitation.OwnerEmail}' da duoc lien ket voi workspace khac."
                    };
                }

                var existingUser = await userRepository
                    .AsQueryable()
                    .IgnoreQueryFilters()
                    .Include(u => u.Employee)
                    .FirstOrDefaultAsync(u =>
                        (!string.IsNullOrWhiteSpace(u.username) && u.username.ToLower() == normalizedOwnerEmail) ||
                        (u.Employee != null &&
                            (
                                (!string.IsNullOrWhiteSpace(u.Employee.email) && u.Employee.email.ToLower() == normalizedOwnerEmail) ||
                                (!string.IsNullOrWhiteSpace(u.Employee.work_email) && u.Employee.work_email.ToLower() == normalizedOwnerEmail)
                            )));

                var existingUserTenantId = existingUser?.tenant_id ?? existingUser?.Employee?.tenant_id;
                if (existingUserTenantId.HasValue && existingUserTenantId.Value != tenant.Id)
                {
                    return new WorkspaceActivationResultDto
                    {
                        Success = false,
                        Status = "error",
                        Message = $"Tai khoan '{invitation.OwnerEmail}' hien dang thuoc workspace khac."
                    };
                }

                await _unitOfWork.BeginTransactionAsync();

                EmployeeEntity employee;
                if (existingEmployee == null)
                {
                    employee = new EmployeeEntity
                    {
                        tenant_id = tenant.Id,
                        employee_code = $"OWNER_{Guid.NewGuid().ToString("N").Substring(0, 4).ToUpper()}",
                        full_name = invitation.OwnerFullName,
                        email = invitation.OwnerEmail,
                        work_email = invitation.OwnerEmail,
                        is_active = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        start_date = DateTime.UtcNow
                    };

                    await employeeRepository.AddAsync(employee);
                }
                else
                {
                    employee = existingEmployee;
                    employee.tenant_id = tenant.Id;
                    employee.full_name = invitation.OwnerFullName;
                    employee.email = invitation.OwnerEmail;
                    employee.work_email = invitation.OwnerEmail;
                    employee.is_active = true;
                    employee.start_date ??= DateTime.UtcNow;
                    employee.UpdatedAt = DateTime.UtcNow;
                    employeeRepository.Update(employee);
                }

                await _unitOfWork.SaveChangesAsync();

                var firebaseUid = await _authService.CreateFirebaseUserAsync(
                    invitation.OwnerEmail,
                    payload.Password,
                    invitation.OwnerFullName,
                    employee.Id,
                    tenant.Id,
                    AuthSecurityConstants.RoleAdminId);

                // Mark invitation as activated
                invitation.Status = "activated";
                invitation.ActivatedAt = DateTime.UtcNow;
                _unitOfWork.Repository<WorkspaceOwnerInvitation>().Update(invitation);

                await _unitOfWork.SaveChangesAsync();

                var localUser = await userRepository
                    .AsQueryable()
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(u => u.firebase_uid == firebaseUid);

                if (localUser == null)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return new WorkspaceActivationResultDto
                    {
                        Success = false,
                        Status = "error",
                        Message = "Khong the khoi tao tai khoan local cho workspace owner."
                    };
                }

                var authResult = await _authService.CreateSessionForUserAsync(
                    localUser.Id,
                    new AuthSessionContextDto
                    {
                        IpAddress = "127.0.0.1",
                        UserAgent = "Nexahrm-Activation-Flow",
                        ResolvedTenantId = tenant.Id
                    },
                    "Kich hoat tai khoan thanh cong");

                if (!authResult.Success)
                {
                    await _unitOfWork.RollbackTransactionAsync();
                    return new WorkspaceActivationResultDto
                    {
                        Success = false,
                        Status = "error",
                        Message = authResult.Message
                    };
                }

                await _unitOfWork.CommitTransactionAsync();

                return new WorkspaceActivationResultDto
                {
                    Success = true,
                    Status = "activated",
                    Session = MapToSession(invitation),
                    Message = "Kích hoạt tài khoản thành công. Đang chuyển hướng...",
                    User = authResult.User,
                    IdToken = authResult.IdToken,
                    RefreshToken = authResult.RefreshToken,
                    CsrfToken = authResult.CsrfToken,
                    ExpiresIn = authResult.ExpiresIn
                };
            }
            catch (Exception ex)
            {
                await _unitOfWork.RollbackTransactionAsync();
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = "error",
                    Message = "Lỗi khi kích hoạt: " + ex.Message
                };
            }
        }

        private static WorkspaceActivationSessionDto MapToSession(WorkspaceOwnerInvitation invitation)
        {
            return new WorkspaceActivationSessionDto
            {
                Token = invitation.ActivationToken,
                CompanyName = invitation.CompanyName ?? "",
                WorkspaceCode = invitation.WorkspaceCode ?? "",
                OwnerFullName = invitation.OwnerFullName ?? "",
                OwnerEmail = invitation.OwnerEmail ?? "",
                PlanName = invitation.TargetPlanCode ?? "", // Using plan code as name here
                IssuedAt = invitation.InvitedAt.ToString("o"),
                ExpiresAt = invitation.ExpiresAt.ToString("o"),
                Status = string.Equals(invitation.Status, "invited", StringComparison.OrdinalIgnoreCase) ? "ready" : invitation.Status,
                InvitedBy = invitation.InvitedBy ?? "admin@nexahrm.com",
                Instructions = new[]
                {
                    "SuperAdmin đã tạo sẵn workspace metadata cho doanh nghiệp của bạn.",
                    "Bạn tự đặt mật khẩu lần đầu. SuperAdmin không được biết mật khẩu này.",
                    "Sau khi kích hoạt thành công, bạn đăng nhập bằng email công việc vào admin-dashboard."
                }
            };
        }
    }
}
