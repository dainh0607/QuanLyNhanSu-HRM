using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using ERP.DTOs.ControlPlane;
using ERP.Entities;
using ERP.Entities.Interfaces;
using ERP.Entities.Models;
using ERP.Entities.Models.ControlPlane;
using Microsoft.EntityFrameworkCore;

namespace ERP.Services.ControlPlane
{
    public class SuperAdminPortalService : ISuperAdminPortalService
    {
        private const string ActivationBaseUrl = "https://admin-dashboard.nexahr.local/activate-workspace-owner";
        private const string SupportSessionBaseUrl = "https://tenant-app.nexahr.local/support-session";
        private const string DefaultSupportNote =
            "Quyền truy cập hỗ trợ bị khóa theo mặc định. Ticket chỉ được kích hoạt sau khi Tenant Owner phê duyệt.";
        private const string WorkspaceIsolationMode = "ticket-only-support";
        private const string ServiceMetadataScope = "service-metadata-only";
        private const int DefaultDraftLeadDays = 7;
        private const int DefaultGracePeriodDays = 7;

        private static readonly Regex WorkspaceCodePattern =
            new Regex("^[A-Z0-9-]+$", RegexOptions.Compiled);

        private static readonly Regex PlanCodePattern =
            new Regex("^[A-Z0-9-]+$", RegexOptions.Compiled);

        private static readonly Regex EmailPattern =
            new Regex("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", RegexOptions.Compiled);

        private readonly AppDbContext _context;
        private readonly ICurrentUserContext _userContext;

        public SuperAdminPortalService(AppDbContext context, ICurrentUserContext userContext)
        {
            _context = context;
            _userContext = userContext;
        }

        public async Task<int> GetTotalTenantsAsync()
        {
            return await _context.Tenants.IgnoreQueryFilters().CountAsync();
        }

        public async Task<int> GetActiveSubscriptionsAsync()
        {
            return await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .CountAsync(subscription => subscription.Status == "active");
        }

        public async Task<ControlPlaneSnapshotDto> GetControlPlaneSnapshotAsync()
        {
            return await BuildSnapshotAsync();
        }

        public async Task<List<TenantSubscriptionDto>> GetTenantDirectoryAsync(
            string? search,
            string? subscriptionStatus)
        {
            var snapshot = await BuildSnapshotAsync();
            var normalizedSearch = search?.Trim();
            var normalizedStatus = NormalizeListFilter(subscriptionStatus);

            return snapshot.Tenants
                .Where(tenant =>
                    MatchesSearch(
                        normalizedSearch,
                        tenant.CompanyName,
                        tenant.WorkspaceCode,
                        tenant.PlanCode,
                        tenant.PortalAdminEmail) &&
                    MatchesFilter(normalizedStatus, tenant.SubscriptionStatus))
                .OrderBy(tenant => tenant.CompanyName)
                .ThenBy(tenant => tenant.WorkspaceCode)
                .ToList();
        }

        public async Task<List<SubscriptionPlanDto>> GetPlansCatalogAsync(
            string? search,
            string? status)
        {
            var snapshot = await BuildSnapshotAsync();
            var normalizedSearch = search?.Trim();
            var normalizedStatus = NormalizeListFilter(status);

            return snapshot.Plans
                .Where(plan =>
                    MatchesSearch(
                        normalizedSearch,
                        plan.Code,
                        plan.Name,
                        plan.Description,
                        plan.SupportSla,
                        string.Join(' ', plan.Modules)) &&
                    MatchesFilter(normalizedStatus, plan.Status))
                .OrderBy(plan => plan.Name)
                .ThenBy(plan => plan.Code)
                .ToList();
        }

        public async Task<BillingListPageDto> GetBillingCatalogAsync(
            string? search,
            string? status,
            int page,
            int pageSize)
        {
            var snapshot = await BuildSnapshotAsync();
            var normalizedSearch = search?.Trim();
            var normalizedStatus = NormalizeListFilter(status);
            var normalizedPageSize = Math.Max(1, pageSize);
            var filteredInvoices = snapshot.Invoices
                .Where(invoice =>
                    MatchesSearch(
                        normalizedSearch,
                        invoice.InvoiceCode,
                        invoice.CompanyName,
                        invoice.WorkspaceCode,
                        invoice.TenantOwnerEmail,
                        invoice.PlanCode) &&
                    MatchesFilter(normalizedStatus, invoice.Status))
                .OrderByDescending(invoice => invoice.IssuedAt)
                .ThenByDescending(invoice => invoice.Id)
                .ToList();

            var total = filteredInvoices.Count;
            var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)normalizedPageSize));
            var normalizedPage = Math.Min(Math.Max(1, page), totalPages);

            return new BillingListPageDto
            {
                Items = filteredInvoices
                    .Skip((normalizedPage - 1) * normalizedPageSize)
                    .Take(normalizedPageSize)
                    .ToList(),
                Total = total,
                Page = normalizedPage,
                PageSize = normalizedPageSize,
                TotalPages = totalPages
            };
        }

        public async Task<List<SupportGrantDto>> GetSupportTicketsAsync(
            string? search,
            string? status)
        {
            var snapshot = await BuildSnapshotAsync();
            var normalizedSearch = search?.Trim();
            var normalizedStatus = NormalizeListFilter(status);

            return snapshot.SupportGrants
                .Where(grant =>
                    MatchesSearch(
                        normalizedSearch,
                        grant.TicketId,
                        grant.CompanyName,
                        grant.WorkspaceCode,
                        grant.TenantOwnerEmail,
                        grant.RequestedScope,
                        grant.RequestedBy) &&
                    MatchesFilter(normalizedStatus, grant.Status))
                .OrderByDescending(grant => grant.ActivatedAt ?? grant.CustomerApprovedAt ?? grant.RequestedAt)
                .ThenByDescending(grant => grant.TicketId)
                .ToList();
        }

        public async Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> CreateWorkspaceOwnerAsync(
            WorkspaceOwnerCreateInputDto input)
        {
            var companyName = input.CompanyName.Trim();
            var workspaceCode = NormalizeWorkspaceCode(input.WorkspaceCode);
            var ownerFullName = input.OwnerFullName.Trim();
            var ownerEmail = NormalizeEmail(input.OwnerEmail);
            var ownerPhone = input.OwnerPhone.Trim();
            var planCode = NormalizePlanCode(input.PlanCode);
            var billingCycle = NormalizeBillingCycle(input.BillingCycle);
            var note = NormalizeNullable(input.Note);

            if (string.IsNullOrWhiteSpace(companyName) ||
                string.IsNullOrWhiteSpace(workspaceCode) ||
                string.IsNullOrWhiteSpace(ownerFullName) ||
                string.IsNullOrWhiteSpace(ownerEmail))
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Vui lòng nhập đầy đủ các trường bắt buộc trước khi tạo lời mời.");
            }

            if (!WorkspaceCodePattern.IsMatch(workspaceCode))
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Mã Workspace chỉ được chứa chữ in hoa, số hoặc dấu gạch ngang.");
            }

            if (!EmailPattern.IsMatch(ownerEmail))
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Email chủ sở hữu chưa đúng định dạng.");
            }

            if (await _context.Tenants.IgnoreQueryFilters().AnyAsync(tenant => tenant.code == workspaceCode) ||
                await _context.WorkspaceOwnerInvitations
                    .IgnoreQueryFilters()
                    .AnyAsync(owner => owner.WorkspaceCode == workspaceCode))
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    $"Mã Workspace {workspaceCode} đã tồn tại hoặc đang nằm trong hàng chờ kích hoạt.");
            }

            if (await _context.WorkspaceOwnerInvitations
                    .IgnoreQueryFilters()
                    .AnyAsync(owner => owner.OwnerEmail.ToLower() == ownerEmail))
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    $"Email {ownerEmail} đã được gán cho một Workspace khác.");
            }

            var plan = await _context.SubscriptionPlans
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.Code == planCode);

            if (plan == null)
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Không tìm thấy gói dịch vụ đã chọn trong metadata hiện tại.");
            }

            if (!plan.IsActive)
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    $"Gói dịch vụ {plan.Code} đang ở trạng thái Ẩn và không thể dùng cho onboarding mới.");
            }

            var now = DateTime.UtcNow;
            var activationToken = GenerateActivationToken(workspaceCode);

            var ownerInvitation = new WorkspaceOwnerInvitation
            {
                CompanyName = companyName,
                WorkspaceCode = workspaceCode,
                OwnerFullName = ownerFullName,
                OwnerEmail = ownerEmail,
                OwnerPhone = ownerPhone,
                TargetPlanCode = plan.Code,
                BillingCycle = billingCycle,
                Status = "invited",
                ActivationToken = activationToken,
                InvitedBy = ResolveActorLabel(),
                Note = note,
                InvitedAt = now,
                LastSentAt = now,
                ExpiresAt = now.AddDays(4)
            };

            await _context.WorkspaceOwnerInvitations.AddAsync(ownerInvitation);

            var tenant = new Tenants
            {
                name = companyName,
                code = workspaceCode,
                subdomain = GenerateSubdomain(workspaceCode),
                is_active = true,
                subscription_expiry = now.AddDays(14),
                CreatedAt = now,
                UpdatedAt = now
            };

            await _context.Tenants.AddAsync(tenant);
            await _context.SaveChangesAsync();

            var subscription = new TenantSubscription
            {
                TenantId = tenant.Id,
                PlanId = plan.Id,
                SubscriptionCode = $"SUB-{workspaceCode}-{now.Year}",
                Status = "trial",
                OnboardingStatus = "setup_in_progress",
                BillingCycle = billingCycle,
                NextRenewalAt = now.AddDays(14),
                LastInvoiceCode = $"INV-{workspaceCode}-PENDING",
                BillingStatus = "draft",
                StorageUsedGb = 0,
                CreatedAt = now,
                UpdatedAt = now
            };

            await _context.TenantSubscriptions.AddAsync(subscription);
            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.WorkspaceOwners.FirstOrDefault(owner => owner.WorkspaceCode == workspaceCode)
                ?? MapWorkspaceOwnerDto(ownerInvitation, new Dictionary<string, string>
                {
                    [plan.Code] = plan.Name
                });

            return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto>
            {
                Success = true,
                Message = "Đã tạo lời mời kích hoạt, sinh token có thời hạn và xếp email kích hoạt vào hàng đợi gửi.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> ResendWorkspaceOwnerInviteAsync(
            string ownerId)
        {
            if (!TryParseIntegerId(ownerId, out var invitationId))
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Mã lời mời kích hoạt không hợp lệ.");
            }

            var owner = await _context.WorkspaceOwnerInvitations
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.Id == invitationId);

            if (owner == null)
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Không tìm thấy lời mời kích hoạt cần gửi lại.");
            }

            var resolvedStatus = ResolveWorkspaceOwnerStatus(owner);
            if (resolvedStatus == "revoked")
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Lời mời này đã bị thu hồi và không thể gửi lại.",
                    MapWorkspaceOwnerDto(owner, await GetPlanNameLookupAsync()));
            }

            if (resolvedStatus == "activated")
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Workspace Owner đã kích hoạt thành công nên không cần gửi lại lời mời.",
                    MapWorkspaceOwnerDto(owner, await GetPlanNameLookupAsync()));
            }

            var now = DateTime.UtcNow;
            var shouldRotateToken = resolvedStatus == "expired" || string.IsNullOrWhiteSpace(owner.ActivationToken);

            if (shouldRotateToken)
            {
                owner.ActivationToken = GenerateActivationToken(owner.WorkspaceCode);
                owner.ExpiresAt = now.AddDays(4);
            }

            owner.Status = "invited";
            owner.LastSentAt = now;

            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.WorkspaceOwners.FirstOrDefault(item => item.Id == ownerId)
                ?? MapWorkspaceOwnerDto(owner, await GetPlanNameLookupAsync());

            return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto>
            {
                Success = true,
                Message = shouldRotateToken
                    ? $"Đã tạo token mới, cập nhật hạn kích hoạt và gửi lại email cho {owner.OwnerEmail}."
                    : $"Đã gửi lại email kích hoạt cho {owner.OwnerEmail}.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<WorkspaceOwnerProvisioningDto>> RevokeWorkspaceOwnerInviteAsync(
            string ownerId)
        {
            if (!TryParseIntegerId(ownerId, out var invitationId))
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Mã lời mời kích hoạt không hợp lệ.");
            }

            var owner = await _context.WorkspaceOwnerInvitations
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.Id == invitationId);

            if (owner == null)
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Không tìm thấy lời mời kích hoạt cần thu hồi.");
            }

            if (ResolveWorkspaceOwnerStatus(owner) == "activated")
            {
                return await CreateFailureResultAsync<WorkspaceOwnerProvisioningDto>(
                    "Workspace Owner đã kích hoạt, nên không thể thu hồi lời mời đã hoàn tất.",
                    MapWorkspaceOwnerDto(owner, await GetPlanNameLookupAsync()));
            }

            owner.Status = "revoked";
            owner.ActivationToken = string.Empty;

            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.WorkspaceOwners.FirstOrDefault(item => item.Id == ownerId)
                ?? MapWorkspaceOwnerDto(owner, await GetPlanNameLookupAsync());

            return new PortalMutationResultDto<WorkspaceOwnerProvisioningDto>
            {
                Success = true,
                Message = $"Đã thu hồi lời mời và vô hiệu hóa token kích hoạt của Workspace {owner.WorkspaceCode}.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<SubscriptionPlanDto>> CreateSubscriptionPlanAsync(
            SubscriptionPlanInputDto input)
        {
            var validationMessage = await ValidatePlanInputAsync(input, null);
            if (validationMessage != null)
            {
                return await CreateFailureResultAsync<SubscriptionPlanDto>(validationMessage);
            }

            var now = DateTime.UtcNow;
            var plan = new SubscriptionPlan
            {
                Code = NormalizePlanCode(input.Code),
                Name = input.Name.Trim(),
                Description = input.Description.Trim(),
                MonthlyPriceVnd = Math.Round(input.MonthlyPriceVnd, 0),
                StorageLimitGb = Math.Max(0, input.StorageLimitGb),
                AdminSeatLimit = Math.Max(0, input.AdminSeatLimit),
                EmployeeSeatLimit = Math.Max(0, input.EmployeeSeatLimit),
                SupportSla = input.SupportSla.Trim(),
                Modules = SerializeModules(input.Modules),
                Highlight = NormalizeNullable(input.Highlight),
                IsActive = NormalizePlanStatus(input.Status) == "active",
                CreatedAt = now,
                UpdatedAt = now
            };

            await _context.SubscriptionPlans.AddAsync(plan);
            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.Plans.FirstOrDefault(item => item.Id == plan.Id.ToString(CultureInfo.InvariantCulture))
                ?? MapPlanDto(plan);

            return new PortalMutationResultDto<SubscriptionPlanDto>
            {
                Success = true,
                Message = $"Đã tạo gói dịch vụ {plan.Code} và làm mới danh mục cấu hình.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<SubscriptionPlanDto>> UpdateSubscriptionPlanAsync(
            string planId,
            SubscriptionPlanInputDto input)
        {
            if (!TryParseIntegerId(planId, out var numericPlanId))
            {
                return await CreateFailureResultAsync<SubscriptionPlanDto>("Mã gói dịch vụ không hợp lệ.");
            }

            var plan = await _context.SubscriptionPlans
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.Id == numericPlanId);

            if (plan == null)
            {
                return await CreateFailureResultAsync<SubscriptionPlanDto>("Không tìm thấy gói dịch vụ cần cập nhật.");
            }

            var validationMessage = await ValidatePlanInputAsync(input, numericPlanId);
            if (validationMessage != null)
            {
                return await CreateFailureResultAsync(validationMessage, MapPlanDto(plan));
            }

            var previousCode = plan.Code;
            plan.Code = NormalizePlanCode(input.Code);
            plan.Name = input.Name.Trim();
            plan.Description = input.Description.Trim();
            plan.MonthlyPriceVnd = Math.Round(input.MonthlyPriceVnd, 0);
            plan.StorageLimitGb = Math.Max(0, input.StorageLimitGb);
            plan.AdminSeatLimit = Math.Max(0, input.AdminSeatLimit);
            plan.EmployeeSeatLimit = Math.Max(0, input.EmployeeSeatLimit);
            plan.SupportSla = input.SupportSla.Trim();
            plan.Modules = SerializeModules(input.Modules);
            plan.Highlight = NormalizeNullable(input.Highlight);
            plan.IsActive = NormalizePlanStatus(input.Status) == "active";
            plan.UpdatedAt = DateTime.UtcNow;

            if (!string.Equals(previousCode, plan.Code, StringComparison.Ordinal))
            {
                var invitations = await _context.WorkspaceOwnerInvitations
                    .IgnoreQueryFilters()
                    .Where(owner => owner.TargetPlanCode == previousCode)
                    .ToListAsync();

                foreach (var invitation in invitations)
                {
                    invitation.TargetPlanCode = plan.Code;
                }
            }

            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.Plans.FirstOrDefault(item => item.Id == planId)
                ?? MapPlanDto(plan);

            return new PortalMutationResultDto<SubscriptionPlanDto>
            {
                Success = true,
                Message = plan.IsActive
                    ? $"Đã cập nhật cấu hình gói {plan.Code}."
                    : $"Đã cập nhật gói {plan.Code} và chuyển sang trạng thái Ẩn.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<SubscriptionPlanDto>> DeleteSubscriptionPlanAsync(
            string planId)
        {
            if (!TryParseIntegerId(planId, out var numericPlanId))
            {
                return await CreateFailureResultAsync<SubscriptionPlanDto>("Mã gói dịch vụ không hợp lệ.");
            }

            var plan = await _context.SubscriptionPlans
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.Id == numericPlanId);

            if (plan == null)
            {
                return await CreateFailureResultAsync<SubscriptionPlanDto>("Không tìm thấy gói dịch vụ cần xóa.");
            }

            var activeTenantCount = await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .CountAsync(subscription => subscription.PlanId == numericPlanId);

            var pendingInvitationCount = await _context.WorkspaceOwnerInvitations
                .IgnoreQueryFilters()
                .CountAsync(owner =>
                    owner.TargetPlanCode == plan.Code &&
                    owner.Status != "revoked" &&
                    owner.ActivatedAt == null);

            if (activeTenantCount > 0 || pendingInvitationCount > 0)
            {
                return await CreateFailureResultAsync(
                    $"Không thể xóa gói dịch vụ này vì đang có {activeTenantCount} tenant và {pendingInvitationCount} lời mời onboarding sử dụng. Vui lòng chuyển gói sang trạng thái Ẩn hoặc di chuyển tenant trước.",
                    MapPlanDto(plan));
            }

            _context.SubscriptionPlans.Remove(plan);
            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();

            return new PortalMutationResultDto<SubscriptionPlanDto>
            {
                Success = true,
                Message = $"Đã xóa vĩnh viễn gói dịch vụ {plan.Code} khỏi danh mục Control Plane.",
                Snapshot = snapshot,
                Record = MapPlanDto(plan)
            };
        }

        public async Task<PortalMutationResultDto<InvoiceMetadataDto>> MarkInvoicePaidAsync(
            string invoiceId,
            ManualPaymentInputDto input)
        {
            if (!TryParseIntegerId(invoiceId, out var numericInvoiceId))
            {
                return await CreateFailureResultAsync<InvoiceMetadataDto>("Mã hóa đơn không hợp lệ.");
            }

            var invoice = await _context.InvoiceMetadata
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.Id == numericInvoiceId);

            if (invoice == null)
            {
                return await CreateFailureResultAsync<InvoiceMetadataDto>(
                    "Không tìm thấy hóa đơn cần xác nhận thanh toán.");
            }

            var currentStatus = ResolveInvoiceStatus(invoice);
            if (currentStatus != "upcoming" && currentStatus != "overdue")
            {
                return await CreateFailureResultAsync(
                    "Chỉ hóa đơn Sắp tới hoặc Quá hạn mới có thể được xác nhận thanh toán thủ công.",
                    await GetInvoiceRecordAsync(invoice));
            }

            var paymentGatewayRef = input.PaymentGatewayRef.Trim();
            if (string.IsNullOrWhiteSpace(paymentGatewayRef))
            {
                return await CreateFailureResultAsync(
                    "Vui lòng nhập mã giao dịch trước khi xác nhận thanh toán.",
                    await GetInvoiceRecordAsync(invoice));
            }

            if (!TryParseDateTime(input.ReceivedAt, out var receivedAt))
            {
                return await CreateFailureResultAsync(
                    "Ngày nhận tiền chưa hợp lệ.",
                    await GetInvoiceRecordAsync(invoice));
            }

            await MarkInvoicePaidCoreAsync(invoice, paymentGatewayRef, receivedAt, "manual");

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.Invoices.FirstOrDefault(item => item.Id == invoiceId)
                ?? await GetInvoiceRecordAsync(invoice);
            var tenant = snapshot.Tenants.FirstOrDefault(item => item.Id == invoice.TenantId.ToString(CultureInfo.InvariantCulture));
            var renewalLabel = tenant?.NextRenewalAt.HasValue == true
                ? tenant.NextRenewalAt.Value.ToString("dd/MM/yyyy HH:mm", CultureInfo.InvariantCulture)
                : "chu kỳ kế tiếp";

            return new PortalMutationResultDto<InvoiceMetadataDto>
            {
                Success = true,
                Message = $"Đã ghi nhận thanh toán cho {invoice.InvoiceCode} và gia hạn tenant tới {renewalLabel}.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<InvoiceMetadataDto>> SendInvoiceReminderAsync(
            string invoiceId)
        {
            if (!TryParseIntegerId(invoiceId, out var numericInvoiceId))
            {
                return await CreateFailureResultAsync<InvoiceMetadataDto>("Mã hóa đơn không hợp lệ.");
            }

            var invoice = await _context.InvoiceMetadata
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.Id == numericInvoiceId);

            if (invoice == null)
            {
                return await CreateFailureResultAsync<InvoiceMetadataDto>("Không tìm thấy hóa đơn cần gửi nhắc nợ.");
            }

            var currentStatus = ResolveInvoiceStatus(invoice);
            if (currentStatus != "upcoming" && currentStatus != "overdue")
            {
                return await CreateFailureResultAsync(
                    "Chỉ hóa đơn Sắp tới hoặc Quá hạn mới hỗ trợ gửi nhắc nợ.",
                    await GetInvoiceRecordAsync(invoice));
            }

            invoice.ReminderSentAt = DateTime.UtcNow;
            invoice.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.Invoices.FirstOrDefault(item => item.Id == invoiceId)
                ?? await GetInvoiceRecordAsync(invoice);

            return new PortalMutationResultDto<InvoiceMetadataDto>
            {
                Success = true,
                Message = $"Đã gửi lại email nhắc thanh toán cho {record.TenantOwnerEmail} ({invoice.InvoiceCode}).",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<InvoiceMetadataDto>> UpdateDraftInvoiceAsync(
            string invoiceId,
            DraftInvoiceUpdateInputDto input)
        {
            if (!TryParseIntegerId(invoiceId, out var numericInvoiceId))
            {
                return await CreateFailureResultAsync<InvoiceMetadataDto>("Mã hóa đơn không hợp lệ.");
            }

            var invoice = await _context.InvoiceMetadata
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.Id == numericInvoiceId);

            if (invoice == null)
            {
                return await CreateFailureResultAsync<InvoiceMetadataDto>("Không tìm thấy hóa đơn nháp cần chỉnh sửa.");
            }

            if (!string.Equals(invoice.Status, "draft", StringComparison.OrdinalIgnoreCase))
            {
                return await CreateFailureResultAsync(
                    "Chỉ hóa đơn ở trạng thái Bản nháp mới được chỉnh sửa.",
                    await GetInvoiceRecordAsync(invoice));
            }

            var validationMessage = ValidateDraftInvoiceInput(input);
            if (validationMessage != null)
            {
                return await CreateFailureResultAsync(
                    validationMessage,
                    await GetInvoiceRecordAsync(invoice));
            }

            TryParseDateTime(input.DueAt, out var dueAt);
            var baseAmount = invoice.BaseAmountVnd > 0 ? invoice.BaseAmountVnd : invoice.AmountVnd;
            var discount = Math.Max(0, Math.Round(input.DiscountVnd, 0));
            var additionalFee = Math.Max(0, Math.Round(input.AdditionalSeatFeeVnd, 0));
            var finalAmount = baseAmount + additionalFee - discount;

            invoice.BaseAmountVnd = baseAmount;
            invoice.DiscountVnd = discount;
            invoice.AdditionalSeatFeeVnd = additionalFee;
            invoice.AmountVnd = finalAmount < 0 ? 0 : finalAmount;
            invoice.SummaryNote = input.SummaryNote.Trim();
            invoice.DueAt = dueAt;
            invoice.GraceEndsAt = dueAt.AddDays(GetGracePeriodDays(invoice));
            invoice.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.Invoices.FirstOrDefault(item => item.Id == invoiceId)
                ?? await GetInvoiceRecordAsync(invoice);

            return new PortalMutationResultDto<InvoiceMetadataDto>
            {
                Success = true,
                Message = $"Đã cập nhật bản nháp {invoice.InvoiceCode}. Kế toán có thể tiếp tục chốt trước khi gửi cho khách hàng.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<InvoiceMetadataDto>> CancelDraftInvoiceAsync(
            string invoiceId)
        {
            if (!TryParseIntegerId(invoiceId, out var numericInvoiceId))
            {
                return await CreateFailureResultAsync<InvoiceMetadataDto>("Mã hóa đơn không hợp lệ.");
            }

            var invoice = await _context.InvoiceMetadata
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.Id == numericInvoiceId);

            if (invoice == null)
            {
                return await CreateFailureResultAsync<InvoiceMetadataDto>("Không tìm thấy hóa đơn nháp cần hủy.");
            }

            if (!string.Equals(invoice.Status, "draft", StringComparison.OrdinalIgnoreCase))
            {
                return await CreateFailureResultAsync(
                    "Chỉ hóa đơn ở trạng thái Bản nháp mới được hủy.",
                    await GetInvoiceRecordAsync(invoice));
            }

            _context.InvoiceMetadata.Remove(invoice);
            await _context.SaveChangesAsync();

            await SyncTenantWithLatestInvoiceAsync(invoice.TenantId);

            var snapshot = await BuildSnapshotAsync();

            return new PortalMutationResultDto<InvoiceMetadataDto>
            {
                Success = true,
                Message = $"Đã hủy bản nháp {invoice.InvoiceCode} khỏi hàng chờ phát hành.",
                Snapshot = snapshot,
                Record = await GetInvoiceRecordAsync(invoice)
            };
        }

        public async Task<PortalMutationResultDto<InvoiceMetadataDto>> ProcessPaymentGatewayWebhookAsync(
            PaymentGatewayWebhookInputDto input)
        {
            InvoiceMetadata? invoice = null;

            if (TryParseIntegerId(input.InvoiceId, out var invoiceId))
            {
                invoice = await _context.InvoiceMetadata
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(item => item.Id == invoiceId);
            }

            if (invoice == null && !string.IsNullOrWhiteSpace(input.InvoiceCode))
            {
                var invoiceCode = input.InvoiceCode.Trim().ToUpperInvariant();
                invoice = await _context.InvoiceMetadata
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(item => item.InvoiceCode == invoiceCode);
            }

            if (invoice == null)
            {
                return await CreateFailureResultAsync<InvoiceMetadataDto>(
                    "Webhook không khớp với hóa đơn nào trong metadata Control Plane.");
            }

            if (string.IsNullOrWhiteSpace(input.PaymentGatewayRef))
            {
                return await CreateFailureResultAsync(
                    "Thiếu mã giao dịch cổng thanh toán.",
                    await GetInvoiceRecordAsync(invoice));
            }

            if (!TryParseDateTime(input.PaidAt, out var paidAt))
            {
                return await CreateFailureResultAsync(
                    "Thời điểm thanh toán từ webhook chưa hợp lệ.",
                    await GetInvoiceRecordAsync(invoice));
            }

            await MarkInvoicePaidCoreAsync(invoice, input.PaymentGatewayRef.Trim(), paidAt, NormalizePaymentSource(input.Source));

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.Invoices.FirstOrDefault(item => item.Id == invoice.Id.ToString(CultureInfo.InvariantCulture))
                ?? await GetInvoiceRecordAsync(invoice);

            return new PortalMutationResultDto<InvoiceMetadataDto>
            {
                Success = true,
                Message = $"Đã ghi nhận webhook thanh toán cho {invoice.InvoiceCode}.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<InvoicePdfFileResultDto?> GenerateInvoicePdfAsync(string invoiceId)
        {
            if (!TryParseIntegerId(invoiceId, out var numericInvoiceId))
            {
                return null;
            }

            var snapshot = await BuildSnapshotAsync();
            var invoice = snapshot.Invoices.FirstOrDefault(item => item.Id == invoiceId);
            if (invoice == null)
            {
                var entity = await _context.InvoiceMetadata
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(item => item.Id == numericInvoiceId);

                if (entity == null)
                {
                    return null;
                }

                invoice = await GetInvoiceRecordAsync(entity);
            }

            return new InvoicePdfFileResultDto
            {
                FileName = string.IsNullOrWhiteSpace(invoice.PdfFileName)
                    ? $"{invoice.InvoiceCode}.pdf"
                    : invoice.PdfFileName,
                Content = BuildInvoicePdf(invoice)
            };
        }

        public async Task<PortalMutationResultDto<SupportGrantDto>> CreateSupportTicketAsync(
            SupportTicketCreateInputDto input)
        {
            var requestedScope = input.RequestedScope.Trim();
            if (string.IsNullOrWhiteSpace(requestedScope))
            {
                return await CreateFailureResultAsync<SupportGrantDto>(
                    "Vui lòng nhập lý do xin quyền hỗ trợ trước khi gửi ticket.");
            }

            var durationHours = Math.Max(1, input.DurationHours);
            if (durationHours <= 0)
            {
                return await CreateFailureResultAsync<SupportGrantDto>(
                    "Thời lượng xin quyền phải lớn hơn 0 giờ.");
            }

            var tenantSubscription = await ResolveTenantSubscriptionAsync(input.TenantId);
            if (tenantSubscription == null || tenantSubscription.Tenant == null)
            {
                return await CreateFailureResultAsync<SupportGrantDto>(
                    "Không tìm thấy Tenant cần xin quyền hỗ trợ.");
            }

            var now = DateTime.UtcNow;
            var hasOpenTicket = await _context.SupportAccessGrants
                .IgnoreQueryFilters()
                .AnyAsync(grant =>
                    grant.TenantId == tenantSubscription.TenantId &&
                    (grant.Status == "pending_customer_approval" ||
                     (grant.Status == "granted" && (!grant.ExpiresAt.HasValue || grant.ExpiresAt.Value > now))));

            if (hasOpenTicket)
            {
                return await CreateFailureResultAsync<SupportGrantDto>(
                    $"Tenant {tenantSubscription.Tenant.code} đang có ticket chưa kết thúc. Vui lòng xử lý ticket hiện tại trước khi tạo yêu cầu mới.");
            }

            var requestedBy = NormalizeNullable(input.RequestedBy) ?? "NexaHR Super Admin";
            var ticketId = await GenerateSupportTicketCodeAsync();
            var supportGrant = new SupportAccessGrant
            {
                TicketId = ticketId,
                TenantId = tenantSubscription.TenantId,
                WorkspaceCode = NormalizeWorkspaceCode(tenantSubscription.Tenant.code),
                RequestedScope = requestedScope,
                RequestedBy = requestedBy,
                RequestedDurationHours = durationHours,
                Status = "pending_customer_approval",
                Note = DefaultSupportNote,
                CreatedAt = now,
                UpdatedAt = now,
                LastNotifiedAt = now
            };

            await _context.SupportAccessGrants.AddAsync(supportGrant);
            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.SupportGrants.FirstOrDefault(item => item.TicketId == ticketId)
                ?? await GetSupportGrantRecordAsync(supportGrant);
            var tenantEmail = snapshot.Tenants
                .FirstOrDefault(item => item.Id == tenantSubscription.TenantId.ToString(CultureInfo.InvariantCulture))
                ?.PortalAdminEmail;

            return new PortalMutationResultDto<SupportGrantDto>
            {
                Success = true,
                Message = $"Đã tạo {ticketId} và gửi email/notification xin quyền hỗ trợ tới {tenantEmail ?? "Tenant Owner"}.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<SupportGrantDto>> ActivateSupportGrantAsync(string ticketId)
        {
            var normalizedTicketId = ticketId.Trim().ToUpperInvariant();
            var grant = await _context.SupportAccessGrants
                .IgnoreQueryFilters()
                .Include(item => item.Tenant)
                .FirstOrDefaultAsync(item => item.TicketId == normalizedTicketId);

            if (grant == null)
            {
                return await CreateFailureResultAsync<SupportGrantDto>(
                    "Không tìm thấy Support Ticket cần kích hoạt.");
            }

            if (!grant.CustomerApprovedAt.HasValue)
            {
                return await CreateFailureResultAsync(
                    "Khách hàng chưa phê duyệt Support Ticket, nên Control Plane phải tiếp tục khóa quyền truy cập.",
                    await GetSupportGrantRecordAsync(grant));
            }

            var now = DateTime.UtcNow;
            if (ResolveSupportStatus(grant) == "granted" && grant.ExpiresAt.HasValue && grant.ExpiresAt.Value > now)
            {
                return await CreateFailureResultAsync(
                    $"Phiên hỗ trợ {grant.TicketId} đang còn hiệu lực tới {grant.ExpiresAt.Value.ToLocalTime():dd/MM/yyyy HH:mm}.",
                    await GetSupportGrantRecordAsync(grant));
            }

            grant.Status = "granted";
            grant.ActivatedAt = now;
            grant.ExpiresAt = now.AddHours(Math.Max(1, grant.RequestedDurationHours));
            grant.RevokedAt = null;
            grant.LastNotifiedAt = now;
            grant.UpdatedAt = now;

            await _context.SaveChangesAsync();

            var impersonationToken = GenerateImpersonationToken(grant.TicketId, grant.WorkspaceCode);
            var sessionLaunchUrl = CreateSupportSessionUrl(grant.WorkspaceCode, grant.TicketId, impersonationToken);
            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.SupportGrants.FirstOrDefault(item => item.TicketId == normalizedTicketId)
                ?? await GetSupportGrantRecordAsync(grant);

            record.Status = "granted";
            record.ActivatedAt = grant.ActivatedAt;
            record.ExpiresAt = grant.ExpiresAt;
            record.LastNotifiedAt = grant.LastNotifiedAt;
            record.RevokedAt = null;
            record.ImpersonationToken = impersonationToken;
            record.SessionLaunchUrl = sessionLaunchUrl;

            return new PortalMutationResultDto<SupportGrantDto>
            {
                Success = true,
                Message = $"Đã phát hành impersonation token cho {grant.WorkspaceCode} và sẵn sàng mở phiên hỗ trợ tới {grant.ExpiresAt?.ToLocalTime():dd/MM/yyyy HH:mm}.",
                Snapshot = snapshot,
                Record = record
            };
        }

        public async Task<PortalMutationResultDto<SupportGrantDto>> RevokeSupportGrantAsync(string ticketId)
        {
            var normalizedTicketId = ticketId.Trim().ToUpperInvariant();
            var grant = await _context.SupportAccessGrants
                .IgnoreQueryFilters()
                .Include(item => item.Tenant)
                .FirstOrDefaultAsync(item => item.TicketId == normalizedTicketId);

            if (grant == null)
            {
                return await CreateFailureResultAsync<SupportGrantDto>(
                    "Không tìm thấy Support Ticket cần thu hồi.");
            }

            if (ResolveSupportStatus(grant) != "granted")
            {
                return await CreateFailureResultAsync(
                    "Chỉ phiên hỗ trợ đang hoạt động mới có thể thu hồi ngay lập tức.",
                    await GetSupportGrantRecordAsync(grant));
            }

            var now = DateTime.UtcNow;
            grant.Status = "expired";
            grant.RevokedAt = now;
            grant.ExpiresAt = now;
            grant.LastNotifiedAt = now;
            grant.UpdatedAt = now;

            await _context.SaveChangesAsync();

            var snapshot = await BuildSnapshotAsync();
            var record = snapshot.SupportGrants.FirstOrDefault(item => item.TicketId == normalizedTicketId)
                ?? await GetSupportGrantRecordAsync(grant);

            return new PortalMutationResultDto<SupportGrantDto>
            {
                Success = true,
                Message = $"Đã thu hồi sớm phiên hỗ trợ {grant.TicketId}; token impersonation đã bị vô hiệu hóa và UI được chuyển sang Hết hạn.",
                Snapshot = snapshot,
                Record = record
            };
        }

        private async Task<ControlPlaneSnapshotDto> BuildSnapshotAsync()
        {
            var plans = await _context.SubscriptionPlans
                .IgnoreQueryFilters()
                .OrderBy(plan => plan.Name)
                .ThenBy(plan => plan.Code)
                .ToListAsync();

            var tenantSubscriptions = await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .Include(subscription => subscription.Tenant)
                .Include(subscription => subscription.Plan)
                .OrderByDescending(subscription => subscription.CreatedAt)
                .ToListAsync();

            var invoices = await _context.InvoiceMetadata
                .IgnoreQueryFilters()
                .Include(invoice => invoice.Tenant)
                .OrderByDescending(invoice => invoice.IssuedAt)
                .ThenByDescending(invoice => invoice.Id)
                .ToListAsync();

            var supportGrants = await _context.SupportAccessGrants
                .IgnoreQueryFilters()
                .Include(grant => grant.Tenant)
                .OrderByDescending(grant => grant.CreatedAt)
                .ToListAsync();

            var workspaceOwners = await _context.WorkspaceOwnerInvitations
                .IgnoreQueryFilters()
                .OrderByDescending(owner => owner.InvitedAt)
                .ToListAsync();

            var employeeCounts = await _context.Employees
                .IgnoreQueryFilters()
                .Where(employee => employee.tenant_id.HasValue && employee.is_active && !employee.is_resigned)
                .GroupBy(employee => employee.tenant_id!.Value)
                .ToDictionaryAsync(group => group.Key, group => group.Count());

            var userCounts = await _context.Users
                .IgnoreQueryFilters()
                .Where(user => user.tenant_id.HasValue && user.is_active)
                .GroupBy(user => user.tenant_id!.Value)
                .ToDictionaryAsync(group => group.Key, group => group.Count());

            var userEmails = await _context.Users
                .IgnoreQueryFilters()
                .Where(user => user.tenant_id.HasValue && user.is_active)
                .Select(user => new
                {
                    TenantId = user.tenant_id!.Value,
                    Email = user.Employee.work_email ?? user.Employee.email
                })
                .ToListAsync();

            var latestOwnersByWorkspace = workspaceOwners
                .GroupBy(owner => NormalizeWorkspaceCode(owner.WorkspaceCode))
                .ToDictionary(
                    group => group.Key,
                    group => group
                        .OrderByDescending(owner => owner.ActivatedAt ?? owner.InvitedAt)
                        .First());

            var portalAdminEmailsByTenantId = new Dictionary<int, string>();
            foreach (var emailEntry in userEmails)
            {
                var normalizedEmail = NormalizeNullable(emailEntry.Email);
                if (normalizedEmail == null || portalAdminEmailsByTenantId.ContainsKey(emailEntry.TenantId))
                {
                    continue;
                }

                portalAdminEmailsByTenantId[emailEntry.TenantId] = NormalizeEmail(normalizedEmail);
            }

            foreach (var subscription in tenantSubscriptions.Where(item => item.Tenant != null))
            {
                var workspaceCode = NormalizeWorkspaceCode(subscription.Tenant!.code);
                if (!latestOwnersByWorkspace.TryGetValue(workspaceCode, out var owner))
                {
                    continue;
                }

                portalAdminEmailsByTenantId[subscription.TenantId] = NormalizeEmail(owner.OwnerEmail);
            }

            var subscriptionsByTenantId = tenantSubscriptions
                .GroupBy(subscription => subscription.TenantId)
                .ToDictionary(group => group.Key, group => group.First());

            var latestInvoicesByWorkspace = invoices
                .GroupBy(invoice => NormalizeWorkspaceCode(invoice.WorkspaceCode))
                .ToDictionary(group => group.Key, group => group.First());

            var latestSupportGrantsByWorkspace = supportGrants
                .GroupBy(grant => NormalizeWorkspaceCode(grant.WorkspaceCode))
                .ToDictionary(group => group.Key, group => group.First());

            var planNameLookup = plans.ToDictionary(
                plan => NormalizePlanCode(plan.Code),
                plan => plan.Name);

            var tenantDtos = subscriptionsByTenantId.Values
                .Select(subscription =>
                    MapTenantSubscriptionDto(
                        subscription,
                        portalAdminEmailsByTenantId,
                        latestInvoicesByWorkspace,
                        latestSupportGrantsByWorkspace,
                        employeeCounts,
                        userCounts))
                .OrderBy(tenant => tenant.CompanyName)
                .ThenBy(tenant => tenant.WorkspaceCode)
                .ToList();

            var planDtos = plans
                .Select(MapPlanDto)
                .OrderBy(plan => plan.Name)
                .ThenBy(plan => plan.Code)
                .ToList();

            var invoiceDtos = invoices
                .Select(invoice => MapInvoiceDto(invoice, subscriptionsByTenantId, portalAdminEmailsByTenantId))
                .OrderByDescending(invoice => invoice.IssuedAt)
                .ThenByDescending(invoice => invoice.Id)
                .ToList();

            var supportDtos = supportGrants
                .Select(grant => MapSupportGrantDto(grant, subscriptionsByTenantId, portalAdminEmailsByTenantId))
                .OrderByDescending(grant => grant.ActivatedAt ?? grant.CustomerApprovedAt ?? grant.RequestedAt)
                .ThenByDescending(grant => grant.TicketId)
                .ToList();

            var ownerDtos = workspaceOwners
                .Select(owner => MapWorkspaceOwnerDto(owner, planNameLookup))
                .OrderByDescending(owner => owner.InvitedAt)
                .ToList();

            return new ControlPlaneSnapshotDto
            {
                Tenants = tenantDtos,
                Plans = planDtos,
                Invoices = invoiceDtos,
                SupportGrants = supportDtos,
                WorkspaceOwners = ownerDtos
            };
        }

        private TenantSubscriptionDto MapTenantSubscriptionDto(
            TenantSubscription subscription,
            IReadOnlyDictionary<int, string> portalAdminEmailsByTenantId,
            IReadOnlyDictionary<string, InvoiceMetadata> latestInvoicesByWorkspace,
            IReadOnlyDictionary<string, SupportAccessGrant> latestSupportGrantsByWorkspace,
            IReadOnlyDictionary<int, int> employeeCounts,
            IReadOnlyDictionary<int, int> userCounts)
        {
            var tenant = subscription.Tenant;
            var workspaceCode = NormalizeWorkspaceCode(tenant?.code);
            var companyName = tenant?.name?.Trim() ?? workspaceCode;
            latestInvoicesByWorkspace.TryGetValue(workspaceCode, out var latestInvoice);
            latestSupportGrantsByWorkspace.TryGetValue(workspaceCode, out var latestSupportGrant);

            var subscriptionStatus = NormalizeSubscriptionStatus(subscription.Status);
            if (latestInvoice != null)
            {
                var latestInvoiceStatus = ResolveInvoiceStatus(latestInvoice);
                if (latestInvoiceStatus == "overdue" &&
                    latestInvoice.GraceEndsAt.HasValue &&
                    latestInvoice.GraceEndsAt.Value <= DateTime.UtcNow)
                {
                    subscriptionStatus = "suspended";
                }
                else if (latestInvoiceStatus == "overdue" && subscriptionStatus != "trial")
                {
                    subscriptionStatus = "past_due";
                }
            }

            var supportStatus = latestSupportGrant != null
                ? ResolveSupportStatus(latestSupportGrant)
                : "not_requested";

            return new TenantSubscriptionDto
            {
                Id = subscription.TenantId.ToString(CultureInfo.InvariantCulture),
                CompanyName = companyName,
                WorkspaceCode = workspaceCode,
                SubscriptionCode = subscription.SubscriptionCode,
                PlanCode = subscription.Plan?.Code ?? string.Empty,
                PlanName = subscription.Plan?.Name ?? string.Empty,
                SubscriptionStatus = subscriptionStatus,
                OnboardingStatus = NormalizeOnboardingStatus(subscription.OnboardingStatus),
                BillingCycle = NormalizeBillingCycle(subscription.BillingCycle),
                NextRenewalAt = subscription.NextRenewalAt,
                PortalAdminEmail = portalAdminEmailsByTenantId.TryGetValue(subscription.TenantId, out var email)
                    ? email
                    : string.Empty,
                StorageLimitGb = subscription.Plan?.StorageLimitGb ?? 0,
                StorageUsedGb = (int)Math.Round(subscription.StorageUsedGb, 0),
                AdminSeats = userCounts.TryGetValue(subscription.TenantId, out var adminSeatCount)
                    ? adminSeatCount
                    : 1,
                ActiveEmployees = employeeCounts.TryGetValue(subscription.TenantId, out var employeeCount)
                    ? employeeCount
                    : 0,
                LastInvoiceCode = latestInvoice?.InvoiceCode ?? subscription.LastInvoiceCode ?? $"INV-{workspaceCode}-PENDING",
                BillingStatus = latestInvoice != null
                    ? ResolveInvoiceStatus(latestInvoice)
                    : NormalizeBillingStatus(subscription.BillingStatus),
                WorkspaceIsolationMode = WorkspaceIsolationMode,
                SupportAccessStatus = supportStatus,
                SupportAccessExpiresAt = latestSupportGrant?.ExpiresAt,
                SupportTicketId = latestSupportGrant?.TicketId
            };
        }

        private SubscriptionPlanDto MapPlanDto(SubscriptionPlan plan)
        {
            return new SubscriptionPlanDto
            {
                Id = plan.Id.ToString(CultureInfo.InvariantCulture),
                Code = NormalizePlanCode(plan.Code),
                Name = plan.Name.Trim(),
                Description = string.IsNullOrWhiteSpace(plan.Description)
                    ? plan.Name.Trim()
                    : plan.Description.Trim(),
                Status = NormalizePlanStatus(plan.IsActive ? "active" : "hidden"),
                MonthlyPriceVnd = Math.Round(plan.MonthlyPriceVnd, 0),
                StorageLimitGb = Math.Max(0, plan.StorageLimitGb),
                AdminSeatLimit = Math.Max(0, plan.AdminSeatLimit),
                EmployeeSeatLimit = Math.Max(0, plan.EmployeeSeatLimit),
                SupportSla = plan.SupportSla?.Trim() ?? string.Empty,
                Modules = DeserializeModules(plan.Modules),
                Highlight = NormalizeNullable(plan.Highlight)
            };
        }

        private InvoiceMetadataDto MapInvoiceDto(
            InvoiceMetadata invoice,
            IReadOnlyDictionary<int, TenantSubscription> subscriptionsByTenantId,
            IReadOnlyDictionary<int, string> portalAdminEmailsByTenantId)
        {
            subscriptionsByTenantId.TryGetValue(invoice.TenantId, out var subscription);
            var companyName = invoice.Tenant?.name?.Trim()
                ?? subscription?.Tenant?.name?.Trim()
                ?? NormalizeWorkspaceCode(invoice.WorkspaceCode);
            var workspaceCode = NormalizeWorkspaceCode(invoice.WorkspaceCode);
            var planCode = subscription?.Plan?.Code ?? string.Empty;
            var billingCycle = NormalizeBillingCycle(
                string.IsNullOrWhiteSpace(invoice.BillingCycle)
                    ? subscription?.BillingCycle
                    : invoice.BillingCycle);
            var baseAmount = invoice.BaseAmountVnd > 0 ? invoice.BaseAmountVnd : invoice.AmountVnd;
            var discount = invoice.DiscountVnd < 0 ? 0 : invoice.DiscountVnd;
            var additionalFee = invoice.AdditionalSeatFeeVnd < 0 ? 0 : invoice.AdditionalSeatFeeVnd;
            var computedAmount = baseAmount + additionalFee - discount;

            return new InvoiceMetadataDto
            {
                Id = invoice.Id.ToString(CultureInfo.InvariantCulture),
                InvoiceCode = invoice.InvoiceCode.Trim().ToUpperInvariant(),
                TenantId = invoice.TenantId.ToString(CultureInfo.InvariantCulture),
                CompanyName = companyName,
                WorkspaceCode = workspaceCode,
                TenantOwnerEmail = portalAdminEmailsByTenantId.TryGetValue(invoice.TenantId, out var email)
                    ? email
                    : string.Empty,
                PlanCode = NormalizePlanCode(planCode),
                BillingCycle = billingCycle,
                BillingPeriodLabel = invoice.BillingPeriodLabel.Trim(),
                IssuedAt = invoice.IssuedAt,
                DueAt = invoice.DueAt,
                AutoGeneratedAt = invoice.AutoGeneratedAt == default ? invoice.CreatedAt : invoice.AutoGeneratedAt,
                DraftLeadDays = GetDraftLeadDays(invoice),
                AmountVnd = invoice.AmountVnd > 0 ? invoice.AmountVnd : (computedAmount < 0 ? 0 : computedAmount),
                BaseAmountVnd = baseAmount < 0 ? 0 : baseAmount,
                DiscountVnd = discount,
                AdditionalSeatFeeVnd = additionalFee,
                Status = ResolveInvoiceStatus(invoice),
                PaymentGatewayRef = NormalizeNullable(invoice.PaymentGatewayRef),
                PaymentSource = NormalizeNullable(invoice.PaymentSource),
                EmailSentAt = invoice.EmailSentAt,
                ReminderSentAt = invoice.ReminderSentAt,
                PaidAt = invoice.PaidAt,
                ReceivedAt = invoice.ReceivedAt,
                GracePeriodDays = GetGracePeriodDays(invoice),
                GraceEndsAt = invoice.GraceEndsAt,
                PdfFileName = string.IsNullOrWhiteSpace(invoice.PdfFileName)
                    ? $"{invoice.InvoiceCode.Trim().ToUpperInvariant()}.pdf"
                    : invoice.PdfFileName.Trim(),
                SummaryNote = string.IsNullOrWhiteSpace(invoice.SummaryNote)
                    ? $"Hóa đơn gói {NormalizePlanCode(planCode)} cho kỳ {invoice.BillingPeriodLabel.Trim()}."
                    : invoice.SummaryNote.Trim(),
                MetadataScope = ServiceMetadataScope
            };
        }

        private SupportGrantDto MapSupportGrantDto(
            SupportAccessGrant grant,
            IReadOnlyDictionary<int, TenantSubscription> subscriptionsByTenantId,
            IReadOnlyDictionary<int, string> portalAdminEmailsByTenantId,
            string? impersonationToken = null,
            string? sessionLaunchUrl = null)
        {
            subscriptionsByTenantId.TryGetValue(grant.TenantId, out var subscription);
            var requestedBy = string.IsNullOrWhiteSpace(grant.RequestedBy)
                ? "NexaHR Super Admin"
                : grant.RequestedBy.Trim();

            return new SupportGrantDto
            {
                TicketId = grant.TicketId.Trim().ToUpperInvariant(),
                TenantId = grant.TenantId.ToString(CultureInfo.InvariantCulture),
                CompanyName = grant.Tenant?.name?.Trim()
                    ?? subscription?.Tenant?.name?.Trim()
                    ?? NormalizeWorkspaceCode(grant.WorkspaceCode),
                WorkspaceCode = NormalizeWorkspaceCode(grant.WorkspaceCode),
                TenantOwnerEmail = portalAdminEmailsByTenantId.TryGetValue(grant.TenantId, out var email)
                    ? email
                    : string.Empty,
                RequestedAt = grant.CreatedAt,
                RequestedBy = requestedBy,
                RequestedDurationHours = Math.Max(1, grant.RequestedDurationHours),
                RequestedScope = grant.RequestedScope.Trim(),
                CustomerApprovedAt = grant.CustomerApprovedAt,
                ApprovedByCustomerContact = NormalizeNullable(grant.ApprovedByCustomerContact),
                Status = ResolveSupportStatus(grant),
                ExpiresAt = grant.ExpiresAt,
                ActivatedAt = grant.ActivatedAt,
                RevokedAt = grant.RevokedAt,
                LastNotifiedAt = grant.LastNotifiedAt,
                Note = string.IsNullOrWhiteSpace(grant.Note)
                    ? DefaultSupportNote
                    : grant.Note.Trim(),
                ImpersonationToken = impersonationToken,
                SessionLaunchUrl = sessionLaunchUrl,
                AuditActorLabel = $"Hệ thống hỗ trợ - {requestedBy}"
            };
        }

        private WorkspaceOwnerProvisioningDto MapWorkspaceOwnerDto(
            WorkspaceOwnerInvitation owner,
            IReadOnlyDictionary<string, string> planNameLookup)
        {
            var planCode = NormalizePlanCode(owner.TargetPlanCode);

            return new WorkspaceOwnerProvisioningDto
            {
                Id = owner.Id.ToString(CultureInfo.InvariantCulture),
                CompanyName = owner.CompanyName.Trim(),
                WorkspaceCode = NormalizeWorkspaceCode(owner.WorkspaceCode),
                OwnerFullName = owner.OwnerFullName.Trim(),
                OwnerEmail = NormalizeEmail(owner.OwnerEmail),
                OwnerPhone = owner.OwnerPhone?.Trim() ?? string.Empty,
                PlanCode = planCode,
                PlanName = planNameLookup.TryGetValue(planCode, out var planName) ? planName : planCode,
                BillingCycle = NormalizeBillingCycle(owner.BillingCycle),
                Status = ResolveWorkspaceOwnerStatus(owner),
                InvitedAt = owner.InvitedAt,
                LastSentAt = owner.LastSentAt,
                ExpiresAt = owner.ExpiresAt,
                ActivatedAt = owner.ActivatedAt,
                InvitedBy = owner.InvitedBy?.Trim() ?? ResolveActorLabel(),
                Note = NormalizeNullable(owner.Note),
                ActivationToken = ResolveWorkspaceOwnerStatus(owner) == "revoked"
                    ? string.Empty
                    : owner.ActivationToken,
                ActivationLink = ResolveWorkspaceOwnerStatus(owner) == "revoked"
                    ? string.Empty
                    : CreateActivationLink(owner.ActivationToken),
                AdminDashboardUrl = ActivationBaseUrl,
                SecurityBoundary = "owner-sets-password"
            };
        }

        private async Task<string?> ValidatePlanInputAsync(SubscriptionPlanInputDto input, int? currentPlanId)
        {
            var code = NormalizePlanCode(input.Code);
            var name = input.Name.Trim();
            var description = input.Description.Trim();
            var supportSla = input.SupportSla.Trim();
            var modules = NormalizeModules(input.Modules);

            if (string.IsNullOrWhiteSpace(code) ||
                string.IsNullOrWhiteSpace(name) ||
                string.IsNullOrWhiteSpace(description) ||
                string.IsNullOrWhiteSpace(supportSla))
            {
                return "Vui lòng nhập đầy đủ thông tin chung và giới hạn tài nguyên của gói dịch vụ.";
            }

            if (!PlanCodePattern.IsMatch(code))
            {
                return "Mã gói chỉ được chứa chữ in hoa, số hoặc dấu gạch ngang.";
            }

            if (modules.Count == 0)
            {
                return "Vui lòng chọn ít nhất một tính năng cho gói dịch vụ.";
            }

            if (input.MonthlyPriceVnd < 0 ||
                input.StorageLimitGb < 0 ||
                input.AdminSeatLimit < 0 ||
                input.EmployeeSeatLimit < 0)
            {
                return "Các trường số không được âm và phải là giá trị hợp lệ.";
            }

            var duplicatedPlan = await _context.SubscriptionPlans
                .IgnoreQueryFilters()
                .AnyAsync(plan =>
                    plan.Code == code &&
                    (!currentPlanId.HasValue || plan.Id != currentPlanId.Value));

            if (duplicatedPlan)
            {
                return $"Mã gói {code} đã tồn tại trong danh mục hiện tại.";
            }

            return null;
        }

        private static string? ValidateDraftInvoiceInput(DraftInvoiceUpdateInputDto input)
        {
            if (string.IsNullOrWhiteSpace(input.SummaryNote?.Trim()))
            {
                return "Vui lòng nhập ghi chú chi tiết gói cước trước khi lưu bản nháp.";
            }

            if (!TryParseDateTime(input.DueAt, out _))
            {
                return "Ngày đến hạn chưa hợp lệ.";
            }

            if (input.DiscountVnd < 0 || input.AdditionalSeatFeeVnd < 0)
            {
                return "Giảm giá và phí phát sinh không được âm.";
            }

            return null;
        }

        private async Task MarkInvoicePaidCoreAsync(
            InvoiceMetadata invoice,
            string paymentGatewayRef,
            DateTime receivedAt,
            string paymentSource)
        {
            invoice.Status = "paid";
            invoice.PaymentGatewayRef = paymentGatewayRef;
            invoice.PaymentSource = paymentSource;
            invoice.ReceivedAt = receivedAt;
            invoice.PaidAt = receivedAt;
            invoice.GraceEndsAt = invoice.DueAt.AddDays(GetGracePeriodDays(invoice));
            invoice.UpdatedAt = DateTime.UtcNow;

            await SyncTenantAfterInvoiceMutationAsync(invoice, "paid");
            await _context.SaveChangesAsync();
        }

        private async Task SyncTenantAfterInvoiceMutationAsync(InvoiceMetadata invoice, string nextStatus)
        {
            var subscription = await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.TenantId == invoice.TenantId);

            if (subscription == null)
            {
                return;
            }

            subscription.LastInvoiceCode = invoice.InvoiceCode;
            subscription.BillingStatus = nextStatus;
            subscription.UpdatedAt = DateTime.UtcNow;

            if (nextStatus == "paid")
            {
                if (NormalizeSubscriptionStatus(subscription.Status) != "trial")
                {
                    subscription.Status = "active";
                }

                subscription.NextRenewalAt = AddBillingCycle(subscription.NextRenewalAt, subscription.BillingCycle);

                var tenant = await _context.Tenants
                    .IgnoreQueryFilters()
                    .FirstOrDefaultAsync(item => item.Id == invoice.TenantId);
                if (tenant != null)
                {
                    tenant.subscription_expiry = subscription.NextRenewalAt;
                    tenant.UpdatedAt = DateTime.UtcNow;
                }
            }
            else if (nextStatus == "overdue" && NormalizeSubscriptionStatus(subscription.Status) != "trial")
            {
                subscription.Status = invoice.GraceEndsAt.HasValue && invoice.GraceEndsAt.Value <= DateTime.UtcNow
                    ? "suspended"
                    : "past_due";
            }
        }

        private async Task SyncTenantWithLatestInvoiceAsync(int tenantId)
        {
            var subscription = await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(item => item.TenantId == tenantId);

            if (subscription == null)
            {
                return;
            }

            var latestInvoice = await _context.InvoiceMetadata
                .IgnoreQueryFilters()
                .Where(item => item.TenantId == tenantId)
                .OrderByDescending(item => item.IssuedAt)
                .ThenByDescending(item => item.Id)
                .FirstOrDefaultAsync();

            subscription.LastInvoiceCode = latestInvoice?.InvoiceCode;
            subscription.BillingStatus = latestInvoice != null
                ? ResolveInvoiceStatus(latestInvoice)
                : "draft";
            subscription.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }

        private async Task<TenantSubscription?> ResolveTenantSubscriptionAsync(string tenantIdOrWorkspace)
        {
            if (TryParseIntegerId(tenantIdOrWorkspace, out var tenantId))
            {
                return await _context.TenantSubscriptions
                    .IgnoreQueryFilters()
                    .Include(item => item.Tenant)
                    .Include(item => item.Plan)
                    .OrderByDescending(item => item.CreatedAt)
                    .FirstOrDefaultAsync(item => item.TenantId == tenantId);
            }

            var workspaceCode = NormalizeWorkspaceCode(tenantIdOrWorkspace);
            return await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .Include(item => item.Tenant)
                .Include(item => item.Plan)
                .OrderByDescending(item => item.CreatedAt)
                .FirstOrDefaultAsync(item => item.Tenant != null && item.Tenant.code == workspaceCode);
        }

        private async Task<SupportGrantDto> GetSupportGrantRecordAsync(SupportAccessGrant grant)
        {
            var subscriptionList = await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .Include(item => item.Tenant)
                .Include(item => item.Plan)
                .OrderByDescending(item => item.CreatedAt)
                .ToListAsync();

            var subscriptionsByTenantId = subscriptionList
                .GroupBy(item => item.TenantId)
                .ToDictionary(group => group.Key, group => group.First());

            var portalAdminEmailsByTenantId = await BuildPortalAdminEmailLookupAsync();

            return MapSupportGrantDto(grant, subscriptionsByTenantId, portalAdminEmailsByTenantId);
        }

        private async Task<InvoiceMetadataDto> GetInvoiceRecordAsync(InvoiceMetadata invoice)
        {
            var subscriptionList = await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .Include(item => item.Tenant)
                .Include(item => item.Plan)
                .OrderByDescending(item => item.CreatedAt)
                .ToListAsync();

            var subscriptionsByTenantId = subscriptionList
                .GroupBy(item => item.TenantId)
                .ToDictionary(group => group.Key, group => group.First());

            var portalAdminEmailsByTenantId = await BuildPortalAdminEmailLookupAsync();

            return MapInvoiceDto(invoice, subscriptionsByTenantId, portalAdminEmailsByTenantId);
        }

        private async Task<Dictionary<string, string>> GetPlanNameLookupAsync()
        {
            return await _context.SubscriptionPlans
                .IgnoreQueryFilters()
                .ToDictionaryAsync(plan => NormalizePlanCode(plan.Code), plan => plan.Name);
        }

        private async Task<Dictionary<int, string>> BuildPortalAdminEmailLookupAsync()
        {
            var lookup = await _context.Users
                .IgnoreQueryFilters()
                .Where(user => user.tenant_id.HasValue && user.is_active)
                .Select(user => new
                {
                    TenantId = user.tenant_id!.Value,
                    Email = user.Employee.work_email ?? user.Employee.email
                })
                .ToListAsync();

            var result = lookup
                .Where(item => !string.IsNullOrWhiteSpace(item.Email))
                .GroupBy(item => item.TenantId)
                .ToDictionary(group => group.Key, group => NormalizeEmail(group.First().Email!));

            var owners = await _context.WorkspaceOwnerInvitations
                .IgnoreQueryFilters()
                .OrderByDescending(owner => owner.ActivatedAt ?? owner.InvitedAt)
                .ToListAsync();

            var tenants = await _context.TenantSubscriptions
                .IgnoreQueryFilters()
                .Include(subscription => subscription.Tenant)
                .ToListAsync();

            var ownerLookupByWorkspace = owners
                .GroupBy(owner => NormalizeWorkspaceCode(owner.WorkspaceCode))
                .ToDictionary(group => group.Key, group => group.First());

            foreach (var subscription in tenants.Where(item => item.Tenant != null))
            {
                var workspaceCode = NormalizeWorkspaceCode(subscription.Tenant!.code);
                if (ownerLookupByWorkspace.TryGetValue(workspaceCode, out var owner))
                {
                    result[subscription.TenantId] = NormalizeEmail(owner.OwnerEmail);
                }
            }

            return result;
        }

        private async Task<PortalMutationResultDto<T>> CreateFailureResultAsync<T>(
            string message,
            T record = default!)
        {
            return new PortalMutationResultDto<T>
            {
                Success = false,
                Message = message,
                Snapshot = await BuildSnapshotAsync(),
                Record = record
            };
        }

        private async Task<string> GenerateSupportTicketCodeAsync()
        {
            var ticketIds = await _context.SupportAccessGrants
                .IgnoreQueryFilters()
                .Select(grant => grant.TicketId)
                .ToListAsync();

            var maxSequence = 2400;
            foreach (var ticketId in ticketIds)
            {
                if (string.IsNullOrWhiteSpace(ticketId))
                {
                    continue;
                }

                var digits = new string(ticketId.Where(char.IsDigit).ToArray());
                if (int.TryParse(digits, NumberStyles.Integer, CultureInfo.InvariantCulture, out var parsedValue))
                {
                    maxSequence = Math.Max(maxSequence, parsedValue);
                }
            }

            return $"SUP-{maxSequence + 1}";
        }

        private static List<string> DeserializeModules(string? modulesJson)
        {
            if (string.IsNullOrWhiteSpace(modulesJson))
            {
                return new List<string>();
            }

            try
            {
                var parsed = JsonSerializer.Deserialize<List<string>>(modulesJson);
                if (parsed != null)
                {
                    return NormalizeModules(parsed);
                }
            }
            catch
            {
                // Fallback to comma-separated values below.
            }

            return NormalizeModules(modulesJson.Split(',', StringSplitOptions.RemoveEmptyEntries));
        }

        private static string SerializeModules(IEnumerable<string> modules)
        {
            return JsonSerializer.Serialize(NormalizeModules(modules));
        }

        private static List<string> NormalizeModules(IEnumerable<string> modules)
        {
            return modules
                .Select(module => module?.Trim())
                .Where(module => !string.IsNullOrWhiteSpace(module))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .ToList()!;
        }

        private static string NormalizeWorkspaceCode(string? value)
        {
            return (value ?? string.Empty).Trim().ToUpperInvariant();
        }

        private static string NormalizePlanCode(string? value)
        {
            return (value ?? string.Empty)
                .Trim()
                .ToUpperInvariant()
                .Replace(' ', '-');
        }

        private static string NormalizeEmail(string? value)
        {
            return (value ?? string.Empty).Trim().ToLowerInvariant();
        }

        private static string NormalizeBillingCycle(string? value)
        {
            return value?.Trim().ToLowerInvariant() switch
            {
                "quarterly" => "quarterly",
                "yearly" => "yearly",
                _ => "monthly"
            };
        }

        private static string NormalizePlanStatus(string? value)
        {
            return string.Equals(value, "hidden", StringComparison.OrdinalIgnoreCase)
                ? "hidden"
                : "active";
        }

        private static string NormalizeBillingStatus(string? value)
        {
            return value?.Trim().ToLowerInvariant() switch
            {
                "paid" => "paid",
                "upcoming" => "upcoming",
                "overdue" => "overdue",
                _ => "draft"
            };
        }

        private static string NormalizeSubscriptionStatus(string? value)
        {
            return value?.Trim().ToLowerInvariant() switch
            {
                "active" => "active",
                "past_due" => "past_due",
                "suspended" => "suspended",
                _ => "trial"
            };
        }

        private static string NormalizeOnboardingStatus(string? value)
        {
            return value?.Trim().ToLowerInvariant() switch
            {
                "awaiting_contract" => "awaiting_contract",
                "ready" => "ready",
                "trial" => "trial",
                _ => "setup_in_progress"
            };
        }

        private static string NormalizePaymentSource(string? value)
        {
            return string.Equals(value, "manual", StringComparison.OrdinalIgnoreCase)
                ? "manual"
                : "gateway";
        }

        private static string? NormalizeNullable(string? value)
        {
            var trimmed = value?.Trim();
            return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
        }

        private static string NormalizeListFilter(string? value)
        {
            return string.IsNullOrWhiteSpace(value) ? "all" : value.Trim().ToLowerInvariant();
        }

        private static bool MatchesFilter(string normalizedFilter, string value)
        {
            return normalizedFilter == "all" ||
                   string.Equals(value, normalizedFilter, StringComparison.OrdinalIgnoreCase);
        }

        private static bool MatchesSearch(string? search, params string?[] fields)
        {
            if (string.IsNullOrWhiteSpace(search))
            {
                return true;
            }

            return fields.Any(field =>
                !string.IsNullOrWhiteSpace(field) &&
                field.Contains(search, StringComparison.OrdinalIgnoreCase));
        }

        private static string ResolveWorkspaceOwnerStatus(WorkspaceOwnerInvitation owner)
        {
            if (string.Equals(owner.Status, "revoked", StringComparison.OrdinalIgnoreCase))
            {
                return "revoked";
            }

            if (owner.ActivatedAt.HasValue || string.Equals(owner.Status, "activated", StringComparison.OrdinalIgnoreCase))
            {
                return "activated";
            }

            if (owner.ExpiresAt <= DateTime.UtcNow || string.Equals(owner.Status, "expired", StringComparison.OrdinalIgnoreCase))
            {
                return "expired";
            }

            return "invited";
        }

        private static string ResolveInvoiceStatus(InvoiceMetadata invoice)
        {
            if (invoice.PaidAt.HasValue || string.Equals(invoice.Status, "paid", StringComparison.OrdinalIgnoreCase))
            {
                return "paid";
            }

            if (string.Equals(invoice.Status, "draft", StringComparison.OrdinalIgnoreCase))
            {
                return "draft";
            }

            if (string.Equals(invoice.Status, "overdue", StringComparison.OrdinalIgnoreCase) || invoice.DueAt <= DateTime.UtcNow)
            {
                return "overdue";
            }

            return "upcoming";
        }

        private static string ResolveSupportStatus(SupportAccessGrant grant)
        {
            var normalizedStatus = grant.Status?.Trim().ToLowerInvariant() switch
            {
                "pending_customer_approval" => "pending_customer_approval",
                "granted" => "granted",
                "revoked" => "expired",
                "expired" => "expired",
                _ => "not_requested"
            };

            if (normalizedStatus == "granted" && grant.ExpiresAt.HasValue && grant.ExpiresAt.Value <= DateTime.UtcNow)
            {
                return "expired";
            }

            return normalizedStatus;
        }

        private static int GetDraftLeadDays(InvoiceMetadata invoice)
        {
            return invoice.DraftLeadDays > 0 ? invoice.DraftLeadDays : DefaultDraftLeadDays;
        }

        private static int GetGracePeriodDays(InvoiceMetadata invoice)
        {
            return invoice.GracePeriodDays > 0 ? invoice.GracePeriodDays : DefaultGracePeriodDays;
        }

        private static DateTime AddBillingCycle(DateTime baseDate, string? billingCycle)
        {
            var normalizedCycle = NormalizeBillingCycle(billingCycle);
            return normalizedCycle switch
            {
                "quarterly" => baseDate.AddMonths(3),
                "yearly" => baseDate.AddYears(1),
                _ => baseDate.AddMonths(1)
            };
        }

        private static string GenerateActivationToken(string workspaceCode)
        {
            return $"owner-{NormalizeWorkspaceCode(workspaceCode).ToLowerInvariant()}-{Guid.NewGuid():N}";
        }

        private static string CreateActivationLink(string activationToken)
        {
            return string.IsNullOrWhiteSpace(activationToken)
                ? string.Empty
                : $"{ActivationBaseUrl}?token={Uri.EscapeDataString(activationToken)}";
        }

        private static string GenerateImpersonationToken(string ticketId, string workspaceCode)
        {
            return $"support-{NormalizeWorkspaceCode(workspaceCode).ToLowerInvariant()}-{ticketId.ToLowerInvariant()}-{Guid.NewGuid():N}";
        }

        private static string CreateSupportSessionUrl(string workspaceCode, string ticketId, string token)
        {
            return $"{SupportSessionBaseUrl}?workspace={Uri.EscapeDataString(NormalizeWorkspaceCode(workspaceCode))}&ticket={Uri.EscapeDataString(ticketId)}&token={Uri.EscapeDataString(token)}";
        }

        private static string GenerateSubdomain(string workspaceCode)
        {
            return NormalizeWorkspaceCode(workspaceCode).ToLowerInvariant();
        }

        private static string ResolveActorLabel()
        {
            return "NexaHR Super Admin";
        }

        private static bool TryParseIntegerId(string? value, out int parsedValue)
        {
            return int.TryParse(value, NumberStyles.Integer, CultureInfo.InvariantCulture, out parsedValue);
        }

        private static bool TryParseDateTime(string? value, out DateTime parsedValue)
        {
            return DateTime.TryParse(
                value,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AssumeLocal | DateTimeStyles.AdjustToUniversal,
                out parsedValue);
        }

        private static byte[] BuildInvoicePdf(InvoiceMetadataDto invoice)
        {
            var content = string.Join(
                "\n",
                new[]
                {
                    "BT",
                    "/F1 18 Tf",
                    "50 790 Td",
                    $"({EscapePdfText(invoice.InvoiceCode)}) Tj",
                    "0 -28 Td",
                    "/F1 12 Tf",
                    $"({EscapePdfText($"{invoice.CompanyName} - {invoice.WorkspaceCode}")}) Tj",
                    "0 -22 Td",
                    $"({EscapePdfText($"Amount: {invoice.AmountVnd.ToString(CultureInfo.InvariantCulture)} VND")}) Tj",
                    "0 -22 Td",
                    $"({EscapePdfText($"Status: {invoice.Status}")}) Tj",
                    "0 -22 Td",
                    $"({EscapePdfText($"Period: {invoice.BillingPeriodLabel}")}) Tj",
                    "0 -22 Td",
                    $"({EscapePdfText($"Issued: {invoice.IssuedAt:o}")}) Tj",
                    "0 -22 Td",
                    $"({EscapePdfText($"Due: {invoice.DueAt:o}")}) Tj",
                    "ET"
                });

            var objects = new[]
            {
                "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
                "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj",
                "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
                $"4 0 obj << /Length {content.Length} >> stream\n{content}\nendstream\nendobj",
                "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj"
            };

            var pdfBuilder = new StringBuilder("%PDF-1.4\n");
            var offsets = new List<int> { 0 };

            foreach (var pdfObject in objects)
            {
                offsets.Add(pdfBuilder.Length);
                pdfBuilder.Append(pdfObject).Append('\n');
            }

            var xrefStart = pdfBuilder.Length;
            pdfBuilder.Append("xref\n0 ").Append(objects.Length + 1).Append('\n');
            pdfBuilder.Append("0000000000 65535 f \n");

            foreach (var offset in offsets.Skip(1))
            {
                pdfBuilder.Append(offset.ToString().PadLeft(10, '0')).Append(" 00000 n \n");
            }

            pdfBuilder.Append("trailer << /Size ")
                .Append(objects.Length + 1)
                .Append(" /Root 1 0 R >>\n");
            pdfBuilder.Append("startxref\n").Append(xrefStart).Append("\n%%EOF");

            return Encoding.ASCII.GetBytes(pdfBuilder.ToString());
        }

        private static string EscapePdfText(string value)
        {
            return value.Replace("\\", "\\\\").Replace("(", "\\(").Replace(")", "\\)");
        }
    }
}
