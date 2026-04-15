import {
  initialSupportGrants,
  initialTenants,
  invoiceMetadata,
  subscriptionPlans,
} from "../data";
import type {
  BillingStatus,
  InvoiceMetadata,
  OnboardingStatus,
  SubscriptionPlan,
  SupportGrant,
  SupportAccessStatus,
  TenantSubscription,
} from "../types";

export type WorkspaceOwnerProvisioningStatus =
  | "invited"
  | "activated"
  | "expired"
  | "revoked";

export interface WorkspaceOwnerProvisioning {
  id: string;
  companyName: string;
  workspaceCode: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string;
  planCode: string;
  planName: string;
  billingCycle: TenantSubscription["billingCycle"];
  status: WorkspaceOwnerProvisioningStatus;
  invitedAt: string;
  lastSentAt: string;
  expiresAt: string;
  activatedAt?: string;
  invitedBy: string;
  note?: string;
  activationToken: string;
  activationLink: string;
  adminDashboardUrl: string;
  securityBoundary: "owner-sets-password";
}

export interface WorkspaceOwnerCreateInput {
  companyName: string;
  workspaceCode: string;
  ownerFullName: string;
  ownerEmail: string;
  ownerPhone: string;
  planCode: string;
  billingCycle: TenantSubscription["billingCycle"];
  note?: string;
}

export interface ControlPlaneSnapshot {
  tenants: TenantSubscription[];
  plans: SubscriptionPlan[];
  invoices: InvoiceMetadata[];
  supportGrants: SupportGrant[];
  workspaceOwners: WorkspaceOwnerProvisioning[];
}

export interface PortalMutationResult<T> {
  success: boolean;
  message: string;
  snapshot: ControlPlaneSnapshot;
  record?: T;
}

const MOCK_DELAY_MS = 280;
const ACTIVATION_BASE_URL =
  "https://admin-dashboard.nexahr.local/activate-workspace-owner";

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const createActivationLink = (token: string) =>
  `${ACTIVATION_BASE_URL}?token=${encodeURIComponent(token)}`;

const workspaceOwnersSeed: WorkspaceOwnerProvisioning[] = [
  {
    id: "owner-minhtam",
    companyName: "Minh Tam Retail",
    workspaceCode: "MINHTAM",
    ownerFullName: "Le My Linh",
    ownerEmail: "owner@minhtamretail.vn",
    ownerPhone: "0901234567",
    planCode: "STARTER",
    planName: "Starter",
    billingCycle: "monthly",
    status: "invited",
    invitedAt: "2026-04-14T02:30:00.000Z",
    lastSentAt: "2026-04-14T02:30:00.000Z",
    expiresAt: "2026-04-18T17:00:00.000Z",
    invitedBy: "admin@nexahrm.com",
    note: "Trial workspace owner. Activation link is ready for first login.",
    activationToken: "owner-minhtam-activate-2026",
    activationLink: createActivationLink("owner-minhtam-activate-2026"),
    adminDashboardUrl: ACTIVATION_BASE_URL,
    securityBoundary: "owner-sets-password",
  },
  {
    id: "owner-anphat",
    companyName: "An Phat Logistics",
    workspaceCode: "ANPHAT",
    ownerFullName: "Nguyen Quoc Duy",
    ownerEmail: "admin@anphatlogistics.vn",
    ownerPhone: "0918123456",
    planCode: "GROWTH",
    planName: "Growth",
    billingCycle: "monthly",
    status: "activated",
    invitedAt: "2026-04-09T02:00:00.000Z",
    lastSentAt: "2026-04-09T02:00:00.000Z",
    expiresAt: "2026-04-16T17:00:00.000Z",
    activatedAt: "2026-04-09T05:10:00.000Z",
    invitedBy: "admin@nexahrm.com",
    note: "Existing customer workspace owner already activated.",
    activationToken: "owner-anphat-activate-2026",
    activationLink: createActivationLink("owner-anphat-activate-2026"),
    adminDashboardUrl: ACTIVATION_BASE_URL,
    securityBoundary: "owner-sets-password",
  },
  {
    id: "owner-hoanggia",
    companyName: "Hoang Gia Hospitality",
    workspaceCode: "HOANGGIA",
    ownerFullName: "Pham Thanh Ha",
    ownerEmail: "cio@hoanggia.vn",
    ownerPhone: "0933456789",
    planCode: "ENTERPRISE",
    planName: "Enterprise",
    billingCycle: "yearly",
    status: "expired",
    invitedAt: "2026-04-10T03:15:00.000Z",
    lastSentAt: "2026-04-10T03:15:00.000Z",
    expiresAt: "2026-04-12T17:00:00.000Z",
    invitedBy: "admin@nexahrm.com",
    note: "Waiting for SuperAdmin to resend activation after customer approval.",
    activationToken: "owner-hoanggia-activate-2026",
    activationLink: createActivationLink("owner-hoanggia-activate-2026"),
    adminDashboardUrl: ACTIVATION_BASE_URL,
    securityBoundary: "owner-sets-password",
  },
];

let portalStore: ControlPlaneSnapshot = {
  tenants: clone(initialTenants),
  plans: clone(subscriptionPlans),
  invoices: clone(invoiceMetadata),
  supportGrants: clone(initialSupportGrants),
  workspaceOwners: clone(workspaceOwnersSeed),
};

const simulate = async <T,>(factory: () => T): Promise<T> =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(factory())), MOCK_DELAY_MS);
  });

const getSnapshot = (): ControlPlaneSnapshot => clone(portalStore);

const createTenantRecord = (
  input: WorkspaceOwnerCreateInput,
  plan: SubscriptionPlan,
): TenantSubscription => {
  const now = new Date();
  const renewal = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);
  const workspaceCode = input.workspaceCode.trim().toUpperCase();

  return {
    id: `tenant-${workspaceCode.toLowerCase()}`,
    companyName: input.companyName.trim(),
    workspaceCode,
    subscriptionCode: `SUB-${workspaceCode}-${now.getFullYear()}`,
    planCode: plan.code,
    planName: plan.name,
    subscriptionStatus: "trial",
    onboardingStatus: "setup_in_progress",
    billingCycle: input.billingCycle,
    nextRenewalAt: renewal.toISOString(),
    portalAdminEmail: input.ownerEmail.trim().toLowerCase(),
    storageLimitGb: plan.storageLimitGb,
    storageUsedGb: 0,
    adminSeats: 1,
    activeEmployees: 0,
    lastInvoiceCode: `INV-${workspaceCode}-PENDING`,
    billingStatus: "draft",
    workspaceIsolationMode: "ticket-only-support",
    supportAccessStatus: "not_requested",
  };
};

const updateSupportStatusOnTenant = (
  workspaceCode: string,
  status: SupportAccessStatus,
  expiresAt?: string,
  ticketId?: string,
) => {
  portalStore.tenants = portalStore.tenants.map((tenant) =>
    tenant.workspaceCode === workspaceCode
      ? {
          ...tenant,
          supportAccessStatus: status,
          supportAccessExpiresAt: expiresAt,
          supportTicketId: ticketId,
        }
      : tenant,
  );
};

export const superAdminPortalService = {
  async fetchControlPlaneSnapshot(): Promise<ControlPlaneSnapshot> {
    return simulate(() => getSnapshot());
  },

  async createWorkspaceOwner(
    input: WorkspaceOwnerCreateInput,
  ): Promise<PortalMutationResult<WorkspaceOwnerProvisioning>> {
    const companyName = input.companyName.trim();
    const workspaceCode = input.workspaceCode.trim().toUpperCase();
    const ownerEmail = input.ownerEmail.trim().toLowerCase();
    const ownerFullName = input.ownerFullName.trim();

    return simulate(() => {
      if (!companyName || !workspaceCode || !ownerEmail || !ownerFullName) {
        return {
          success: false,
          message: "Please fill the required workspace owner fields before creating an invite.",
          snapshot: getSnapshot(),
        };
      }

      if (portalStore.tenants.some((tenant) => tenant.workspaceCode === workspaceCode)) {
        return {
          success: false,
          message: `Workspace code ${workspaceCode} already exists in the control plane.`,
          snapshot: getSnapshot(),
        };
      }

      if (
        portalStore.workspaceOwners.some(
          (owner) => owner.ownerEmail === ownerEmail || owner.workspaceCode === workspaceCode,
        )
      ) {
        return {
          success: false,
          message: "Workspace owner email or workspace code is already being provisioned.",
          snapshot: getSnapshot(),
        };
      }

      const plan = portalStore.plans.find((item) => item.code === input.planCode);
      if (!plan) {
        return {
          success: false,
          message: "Selected subscription plan was not found in mock metadata.",
          snapshot: getSnapshot(),
        };
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + 4 * 24 * 60 * 60 * 1000);
      const token = `owner-${workspaceCode.toLowerCase()}-${now.getTime().toString(36)}`;
      const owner: WorkspaceOwnerProvisioning = {
        id: `owner-${workspaceCode.toLowerCase()}`,
        companyName,
        workspaceCode,
        ownerFullName,
        ownerEmail,
        ownerPhone: input.ownerPhone.trim(),
        planCode: plan.code,
        planName: plan.name,
        billingCycle: input.billingCycle,
        status: "invited",
        invitedAt: now.toISOString(),
        lastSentAt: now.toISOString(),
        expiresAt: expiresAt.toISOString(),
        invitedBy: "admin@nexahrm.com",
        note: input.note?.trim(),
        activationToken: token,
        activationLink: createActivationLink(token),
        adminDashboardUrl: ACTIVATION_BASE_URL,
        securityBoundary: "owner-sets-password",
      };

      portalStore.workspaceOwners = [owner, ...portalStore.workspaceOwners];
      portalStore.tenants = [createTenantRecord(input, plan), ...portalStore.tenants];

      return {
        success: true,
        message:
          "Workspace owner invite created in mock mode. The activation link is ready for admin-dashboard onboarding.",
        snapshot: getSnapshot(),
        record: owner,
      };
    });
  },

  async resendWorkspaceOwnerInvite(
    ownerId: string,
  ): Promise<PortalMutationResult<WorkspaceOwnerProvisioning>> {
    return simulate(() => {
      const owner = portalStore.workspaceOwners.find((item) => item.id === ownerId);
      if (!owner) {
        return {
          success: false,
          message: "Workspace owner invite was not found.",
          snapshot: getSnapshot(),
        };
      }

      if (owner.status === "revoked") {
        return {
          success: false,
          message: "This invite has been revoked and cannot be resent.",
          snapshot: getSnapshot(),
          record: owner,
        };
      }

      owner.lastSentAt = new Date().toISOString();
      owner.status = "invited";

      return {
        success: true,
        message: `Activation invite re-sent to ${owner.ownerEmail} in mock mode.`,
        snapshot: getSnapshot(),
        record: owner,
      };
    });
  },

  async revokeWorkspaceOwnerInvite(
    ownerId: string,
  ): Promise<PortalMutationResult<WorkspaceOwnerProvisioning>> {
    return simulate(() => {
      const owner = portalStore.workspaceOwners.find((item) => item.id === ownerId);
      if (!owner) {
        return {
          success: false,
          message: "Workspace owner invite was not found.",
          snapshot: getSnapshot(),
        };
      }

      owner.status = "revoked";

      return {
        success: true,
        message: `Workspace owner invite for ${owner.workspaceCode} has been revoked.`,
        snapshot: getSnapshot(),
        record: owner,
      };
    });
  },

  async activateSupportGrant(
    ticketId: string,
  ): Promise<PortalMutationResult<SupportGrant>> {
    return simulate(() => {
      const grant = portalStore.supportGrants.find((item) => item.ticketId === ticketId);
      if (!grant) {
        return {
          success: false,
          message: "Support ticket was not found.",
          snapshot: getSnapshot(),
        };
      }

      if (!grant.customerApprovedAt) {
        return {
          success: false,
          message:
            "Customer approval is still missing. SuperAdmin must not access the tenant workspace yet.",
          snapshot: getSnapshot(),
          record: grant,
        };
      }

      const expiresAt =
        grant.expiresAt ?? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

      grant.status = "granted";
      grant.expiresAt = expiresAt;
      updateSupportStatusOnTenant(grant.workspaceCode, "granted", expiresAt, grant.ticketId);

      return {
        success: true,
        message: `Support access granted for ${grant.workspaceCode} until ${new Date(
          expiresAt,
        ).toLocaleString("vi-VN")}.`,
        snapshot: getSnapshot(),
        record: grant,
      };
    });
  },

  async revokeSupportGrant(
    ticketId: string,
  ): Promise<PortalMutationResult<SupportGrant>> {
    return simulate(() => {
      const grant = portalStore.supportGrants.find((item) => item.ticketId === ticketId);
      if (!grant) {
        return {
          success: false,
          message: "Support ticket was not found.",
          snapshot: getSnapshot(),
        };
      }

      grant.status = "revoked";
      grant.expiresAt = undefined;
      updateSupportStatusOnTenant(grant.workspaceCode, "not_requested", undefined, undefined);

      return {
        success: true,
        message: `Support access has been revoked for ${grant.workspaceCode}.`,
        snapshot: getSnapshot(),
        record: grant,
      };
    });
  },

  resetMockStore(): void {
    portalStore = {
      tenants: clone(initialTenants),
      plans: clone(subscriptionPlans),
      invoices: clone(invoiceMetadata),
      supportGrants: clone(initialSupportGrants),
      workspaceOwners: clone(workspaceOwnersSeed),
    };
  },
};

export const ownerStatusLabel = (status: WorkspaceOwnerProvisioningStatus) => {
  switch (status) {
    case "invited":
      return "Đã mời";
    case "activated":
      return "Đã kích hoạt";
    case "expired":
      return "Hết hạn";
    case "revoked":
      return "Đã thu hồi";
    default:
      return status;
  }
};

export const onboardingLabel = (status: OnboardingStatus) => {
  switch (status) {
    case "awaiting_contract":
      return "Chờ hợp đồng";
    case "setup_in_progress":
      return "Đang thiết lập";
    case "ready":
      return "Sẵn sàng";
    case "trial":
      return "Dùng thử";
    default:
      return status;
  }
};

export const subscriptionLabel = (status: TenantSubscription["subscriptionStatus"]) => {
  switch (status) {
    case "trial":
      return "Dùng thử";
    case "active":
      return "Hoạt động";
    case "past_due":
      return "Quá hạn";
    case "suspended":
      return "Tạm dừng";
    default:
      return status;
  }
};

export const billingLabel = (status: BillingStatus) => {
  switch (status) {
    case "paid":
      return "Đã thanh toán";
    case "upcoming":
      return "Sắp tới";
    case "overdue":
      return "Quá hạn";
    case "draft":
      return "Bản nháp";
    default:
      return status;
  }
};

export const supportLabel = (status: SupportAccessStatus) => {
  switch (status) {
    case "not_requested":
      return "Bị khóa (Mặc định)";
    case "pending_customer_approval":
      return "Chờ khách hàng phê duyệt";
    case "granted":
      return "Đã cấp quyền";
    case "expired":
      return "Hết hạn";
    case "revoked":
      return "Đã thu hồi";
    default:
      return status;
  }
};
