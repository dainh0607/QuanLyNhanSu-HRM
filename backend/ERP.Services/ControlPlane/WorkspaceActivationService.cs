using System;
using System.Linq;
using System.Threading.Tasks;
using ERP.DTOs.ControlPlane;
using ERP.Entities.Models;
using ERP.Repositories.Interfaces;
using ERP.Services.Auth;
using Microsoft.EntityFrameworkCore;

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

            var invitation = await _unitOfWork.Repository<WorkspaceInvitations>()
                .AsQueryable()
                .FirstOrDefaultAsync(i => i.activation_token == token.Trim());

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
            if (invitation.status == "invited" && invitation.expires_at.HasValue && invitation.expires_at.Value < DateTime.UtcNow)
            {
                invitation.status = "expired";
                _unitOfWork.Repository<WorkspaceInvitations>().Update(invitation);
                await _unitOfWork.SaveChangesAsync();
            }

            var session = MapToSession(invitation);

            return new WorkspaceActivationResultDto
            {
                Success = invitation.status != "not_found",
                Status = invitation.status,
                Session = session,
                Message = invitation.status == "invited"
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

            var invitation = await _unitOfWork.Repository<WorkspaceInvitations>()
                .AsQueryable()
                .FirstOrDefaultAsync(i => i.activation_token == payload.Token.Trim());

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
            if (invitation.status == "invited" && invitation.expires_at.HasValue && invitation.expires_at.Value < DateTime.UtcNow)
            {
                invitation.status = "expired";
                _unitOfWork.Repository<WorkspaceInvitations>().Update(invitation);
                await _unitOfWork.SaveChangesAsync();
            }

            if (invitation.status != "invited")
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = invitation.status,
                    Session = MapToSession(invitation),
                    Message = invitation.status == "activated"
                        ? "Tài khoản này đã được kích hoạt trước đó."
                        : "Liên kết này hiện không thể sử dụng để kích hoạt tài khoản."
                };
            }

            try
            {
                // Create Firebase user with the owner's email and password
                var firebaseUid = await _authService.CreateFirebaseUserAsync(
                    invitation.owner_email,
                    payload.Password,
                    invitation.owner_full_name,
                    0); // 0 = no linked employee for workspace owner

                // Create local user record linked to this workspace owner
                var user = new Users
                {
                    firebase_uid = firebaseUid,
                    username = invitation.owner_email,
                    employee_id = 0,
                    is_active = true,
                    tenant_id = invitation.tenant_id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                await _unitOfWork.Repository<Users>().AddAsync(user);

                // Mark invitation as activated
                invitation.status = "activated";
                invitation.activated_at = DateTime.UtcNow;
                _unitOfWork.Repository<WorkspaceInvitations>().Update(invitation);

                await _unitOfWork.SaveChangesAsync();

                return new WorkspaceActivationResultDto
                {
                    Success = true,
                    Status = "activated",
                    Session = MapToSession(invitation),
                    Message = "Kích hoạt tài khoản thành công. Bạn có thể đăng nhập vào hệ thống."
                };
            }
            catch (Exception ex)
            {
                return new WorkspaceActivationResultDto
                {
                    Success = false,
                    Status = "error",
                    Message = "Lỗi khi kích hoạt: " + ex.Message
                };
            }
        }

        private static WorkspaceActivationSessionDto MapToSession(WorkspaceInvitations invitation)
        {
            return new WorkspaceActivationSessionDto
            {
                Token = invitation.activation_token,
                CompanyName = invitation.company_name ?? "",
                WorkspaceCode = invitation.workspace_code ?? "",
                OwnerFullName = invitation.owner_full_name ?? "",
                OwnerEmail = invitation.owner_email ?? "",
                PlanName = invitation.plan_name ?? "",
                IssuedAt = invitation.invited_at?.ToString("o") ?? "",
                ExpiresAt = invitation.expires_at?.ToString("o") ?? "",
                Status = invitation.status,
                InvitedBy = invitation.invited_by ?? "admin@nexahrm.com",
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
