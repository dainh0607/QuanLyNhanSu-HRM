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
  PaymentTransactionSource,
  SubscriptionPlan,
  SubscriptionPlanStatus,
  SupportGrant,
  SupportAccessStatus,
  TenantSubscription,
} from "../types";
import { API_URL } from "./apiConfig";
import { authFetch } from "./superAdminAuthService";

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
  revokedAt?: string;
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

export interface TenantDirectoryQuery {
  search?: string;
  subscriptionStatus?: TenantSubscription["subscriptionStatus"] | "all";
}

export interface PlanCatalogQuery {
  search?: string;
  status?: SubscriptionPlanStatus | "all";
}

export interface SubscriptionPlanInput {
  code: string;
  name: string;
  description: string;
  status: SubscriptionPlanStatus;
  monthlyPriceVnd: number;
  storageLimitGb: number;
  adminSeatLimit: number;
  employeeSeatLimit: number;
  supportSla: string;
  modules: string[];
  highlight?: string;
}

export interface BillingListQuery {
  search?: string;
  status?: BillingStatus | "all";
  page?: number;
  pageSize?: number;
}

export interface SupportTicketQuery {
  search?: string;
  status?: SupportAccessStatus | "all";
}

export interface BillingListPage {
  items: InvoiceMetadata[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SupportTicketCreateInput {
  tenantId: string;
  durationHours: number;
  requestedScope: string;
  requestedBy?: string;
  requestedByEmail?: string;
}

export interface ManualPaymentInput {
  paymentGatewayRef: string;
  receivedAt: string;
}

export interface DraftInvoiceUpdateInput {
  discountVnd: number;
  additionalSeatFeeVnd: number;
  summaryNote: string;
  dueAt: string;
}

export interface InvoicePdfDownloadResult {
  fileName: string;
  blob: Blob;
}

export interface PaymentGatewayWebhookInput {
  invoiceId?: string;
  invoiceCode?: string;
  paymentGatewayRef: string;
  paidAt: string;
  source: PaymentTransactionSource;
}

export interface PortalMutationResult<T> {
  success: boolean;
  message: string;
  snapshot: ControlPlaneSnapshot;
  record?: T;
}

const MOCK_DELAY_MS = 280;
const CONTROL_PLANE_BASE_URL = `${API_URL}/super-admin/control-plane`;
const CONTROL_PLANE_SNAPSHOT_URL = `${CONTROL_PLANE_BASE_URL}/snapshot`;
const TENANT_DIRECTORY_URL = `${CONTROL_PLANE_BASE_URL}/tenants`;
const PLAN_CATALOG_URL = `${CONTROL_PLANE_BASE_URL}/plans`;
const BILLING_URL = `${CONTROL_PLANE_BASE_URL}/invoices`;
const WORKSPACE_OWNER_URL = `${CONTROL_PLANE_BASE_URL}/workspace-owners`;
const SUPPORT_GRANT_URL = `${CONTROL_PLANE_BASE_URL}/support-grants`;
const PAYMENT_WEBHOOK_URL = `${BILLING_URL}/payment-webhooks`;
const ACTIVATION_BASE_URL =
  "https://admin-dashboard.nexahr.local/activate-workspace-owner";
const SUPPORT_SSO_BASE_URL =
  "https://tenant-app.nexahr.local/support-session";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WORKSPACE_CODE_PATTERN = /^[A-Z0-9-]+$/;
const PLAN_CODE_PATTERN = /^[A-Z0-9-]+$/;
const DEFAULT_BILLING_PAGE_SIZE = 4;

class PortalApiError extends Error {
  readonly canFallback: boolean;

  constructor(
    message: string,
    canFallback: boolean,
  ) {
    super(message);
    this.name = "PortalApiError";
    this.canFallback = canFallback;
  }
}

const clone = <T,>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const simulate = async <T,>(factory: () => T): Promise<T> =>
  new Promise((resolve) => {
    window.setTimeout(() => resolve(clone(factory())), MOCK_DELAY_MS);
  });

const readJsonSafely = async <T,>(response: Response): Promise<T | null> => {
  const rawText = await response.text();
  if (!rawText.trim()) {
    return null;
  }

  try {
    return JSON.parse(rawText) as T;
  } catch {
    return null;
  }
};

const normalizeWorkspaceCode = (workspaceCode: string): string =>
  workspaceCode.trim().toUpperCase();

const normalizeOwnerEmail = (email: string): string =>
  email.trim().toLowerCase();

const normalizePlanCode = (planCode: string): string =>
  planCode
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "-");

const normalizePositiveInteger = (value: number): number =>
  Math.max(0, Math.round(value));

const addDays = (date: Date, days: number): string =>
  new Date(date.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

const addBillingCycle = (
  dateLike: string,
  billingCycle: TenantSubscription["billingCycle"],
): string => {
  const baseDate = new Date(dateLike);

  if (Number.isNaN(baseDate.getTime())) {
    return new Date().toISOString();
  }

  const nextDate = new Date(baseDate);
  if (billingCycle === "quarterly") {
    nextDate.setMonth(nextDate.getMonth() + 3);
  } else if (billingCycle === "yearly") {
    nextDate.setFullYear(nextDate.getFullYear() + 1);
  } else {
    nextDate.setMonth(nextDate.getMonth() + 1);
  }

  return nextDate.toISOString();
};

const generateActivationToken = (workspaceCode: string): string => {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function"
      ? crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
      : Math.random().toString(36).slice(2, 10);

  return `owner-${normalizeWorkspaceCode(workspaceCode).toLowerCase()}-${Date.now().toString(36)}-${suffix}`;
};

const createActivationLink = (token: string) =>
  `${ACTIVATION_BASE_URL}?token=${encodeURIComponent(token)}`;

const addHours = (date: Date, hours: number): string =>
  new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();

const toIsoOrUndefined = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

const generateSupportTicketCode = (): string => {
  const numericPart = portalStore.supportGrants.reduce((max, grant) => {
    const match = grant.ticketId.match(/SUP-(\d+)/i);
    const nextValue = match ? Number(match[1]) : 0;
    return Number.isFinite(nextValue) ? Math.max(max, nextValue) : max;
  }, 2400);

  return `SUP-${numericPart + 1}`;
};

const generateImpersonationToken = (
  ticketId: string,
  workspaceCode: string,
): string => {
  const suffix =
    typeof crypto !== "undefined" && typeof crypto.getRandomValues === "function"
      ? crypto.getRandomValues(new Uint32Array(1))[0].toString(36)
      : Math.random().toString(36).slice(2, 10);

  return `support-${normalizeWorkspaceCode(workspaceCode).toLowerCase()}-${ticketId.toLowerCase()}-${suffix}`;
};

const createSupportSessionUrl = (
  workspaceCode: string,
  ticketId: string,
  token: string,
) =>
  `${SUPPORT_SSO_BASE_URL}?workspace=${encodeURIComponent(
    normalizeWorkspaceCode(workspaceCode),
  )}&ticket=${encodeURIComponent(ticketId)}&token=${encodeURIComponent(token)}`;

const supportSortTimestamp = (grant: SupportGrant): number => {
  const candidates = [
    grant.activatedAt,
    grant.customerApprovedAt,
    grant.requestedAt,
    grant.expiresAt,
  ]
    .map((value) => (value ? Date.parse(value) : Number.NaN))
    .filter((value) => Number.isFinite(value));

  return candidates.length > 0 ? Math.max(...candidates) : 0;
};

const isTimestampExpired = (value?: string): boolean => {
  if (!value) {
    return true;
  }

  return Number.isNaN(Date.parse(value)) || Date.parse(value) <= Date.now();
};

export const resolveWorkspaceOwnerStatus = (
  owner: WorkspaceOwnerProvisioning,
): WorkspaceOwnerProvisioningStatus => {
  if (owner.status === "revoked" || owner.revokedAt) {
    return "revoked";
  }

  if (owner.status === "activated" || owner.activatedAt) {
    return "activated";
  }

  if (owner.status === "expired" || isTimestampExpired(owner.expiresAt)) {
    return "expired";
  }

  return "invited";
};

const normalizeWorkspaceOwner = (
  owner: WorkspaceOwnerProvisioning,
): WorkspaceOwnerProvisioning => {
  const resolvedStatus = resolveWorkspaceOwnerStatus(owner);
  const isRevoked = resolvedStatus === "revoked";

  return {
    ...owner,
    companyName: owner.companyName.trim(),
    workspaceCode: normalizeWorkspaceCode(owner.workspaceCode),
    ownerEmail: normalizeOwnerEmail(owner.ownerEmail),
    ownerFullName: owner.ownerFullName.trim(),
    ownerPhone: owner.ownerPhone.trim(),
    note: owner.note?.trim() || undefined,
    status: resolvedStatus,
    activationToken: isRevoked ? "" : owner.activationToken,
    activationLink: isRevoked ? "" : owner.activationLink,
  };
};

const normalizeSupportGrant = (
  grant: SupportGrant,
  tenant?: TenantSubscription,
): SupportGrant => {
  const workspaceCode = normalizeWorkspaceCode(grant.workspaceCode);
  const requestedAtFallback =
    toIsoOrUndefined(grant.customerApprovedAt) ??
    toIsoOrUndefined(grant.expiresAt) ??
    new Date().toISOString();
  const requestedDurationHours = Math.max(
    1,
    normalizePositiveInteger(grant.requestedDurationHours || 1),
  );
  const requestedAt = toIsoOrUndefined(grant.requestedAt) ?? requestedAtFallback;
  const customerApprovedAt = toIsoOrUndefined(grant.customerApprovedAt);
  const activatedAt = toIsoOrUndefined(grant.activatedAt);
  const revokedAt = toIsoOrUndefined(grant.revokedAt);
  const lastNotifiedAt = toIsoOrUndefined(grant.lastNotifiedAt) ?? requestedAt;
  const expiresAt =
    toIsoOrUndefined(grant.expiresAt) ??
    (activatedAt ? addHours(new Date(activatedAt), requestedDurationHours) : undefined);

  let status: SupportAccessStatus = grant.status;
  if (status === "revoked") {
    status = "expired";
  }

  if (status === "granted" && isTimestampExpired(expiresAt)) {
    status = "expired";
  }

  const requestedBy =
    grant.requestedBy?.trim() ||
    grant.auditActorLabel?.replace(/^Hệ thống hỗ trợ - /, "").trim() ||
    "NexaHR Super Admin";
  const tenantOwnerEmail = normalizeOwnerEmail(
    grant.tenantOwnerEmail ||
      grant.approvedByCustomerContact ||
      tenant?.portalAdminEmail ||
      "",
  );
  const impersonationToken =
    status === "granted" ? grant.impersonationToken?.trim() || undefined : undefined;
  const sessionLaunchUrl =
    status === "granted"
      ? grant.sessionLaunchUrl?.trim() ||
        (impersonationToken
          ? createSupportSessionUrl(workspaceCode, grant.ticketId.trim().toUpperCase(), impersonationToken)
          : undefined)
      : undefined;

  return {
    ...grant,
    ticketId: grant.ticketId.trim().toUpperCase(),
    tenantId: grant.tenantId?.trim() || tenant?.id || `tenant-${workspaceCode.toLowerCase()}`,
    companyName: grant.companyName.trim() || tenant?.companyName || workspaceCode,
    workspaceCode,
    tenantOwnerEmail,
    requestedAt,
    requestedBy,
    requestedDurationHours,
    requestedScope: grant.requestedScope.trim(),
    customerApprovedAt,
    approvedByCustomerContact: grant.approvedByCustomerContact
      ? normalizeOwnerEmail(grant.approvedByCustomerContact)
      : undefined,
    status,
    expiresAt,
    activatedAt,
    revokedAt,
    lastNotifiedAt,
    note:
      grant.note?.trim() ||
      "Quyền truy cập hỗ trợ bị khóa theo mặc định. Mọi thao tác xử lý sự cố tại Tenant đều yêu cầu Ticket hỗ trợ đã được khách hàng phê duyệt.",
    impersonationToken,
    sessionLaunchUrl,
    auditActorLabel:
      grant.auditActorLabel?.trim() || `Hệ thống hỗ trợ - ${requestedBy}`,
  };
};

const normalizePlanStatus = (
  status?: SubscriptionPlanStatus,
): SubscriptionPlanStatus => (status === "hidden" ? "hidden" : "active");

const normalizeSubscriptionPlan = (
  plan: SubscriptionPlan,
): SubscriptionPlan => ({
  ...plan,
  code: normalizePlanCode(plan.code),
  name: plan.name.trim(),
  description: plan.description.trim(),
  status: normalizePlanStatus(plan.status),
  monthlyPriceVnd: normalizePositiveInteger(plan.monthlyPriceVnd),
  storageLimitGb: normalizePositiveInteger(plan.storageLimitGb),
  adminSeatLimit: normalizePositiveInteger(plan.adminSeatLimit),
  employeeSeatLimit: normalizePositiveInteger(plan.employeeSeatLimit),
  supportSla: plan.supportSla.trim(),
  modules: Array.from(
    new Set(plan.modules.map((module) => module.trim()).filter(Boolean)),
  ),
  highlight: plan.highlight?.trim() || undefined,
});

const resolveInvoiceStatus = (invoice: InvoiceMetadata): BillingStatus => {
  if (invoice.status === "paid" || invoice.paidAt) {
    return "paid";
  }

  if (invoice.status === "draft") {
    return "draft";
  }

  if (invoice.status === "overdue") {
    return "overdue";
  }

  if (Date.parse(invoice.dueAt) <= Date.now()) {
    return "overdue";
  }

  return "upcoming";
};

const normalizeInvoice = (invoice: InvoiceMetadata): InvoiceMetadata => {
  const normalizedStatus = resolveInvoiceStatus(invoice);
  const gracePeriodDays = normalizePositiveInteger(invoice.gracePeriodDays || 7) || 7;
  const dueAt = new Date(invoice.dueAt);
  const fallbackGraceEndsAt = Number.isNaN(dueAt.getTime())
    ? undefined
    : addDays(dueAt, gracePeriodDays);

  return {
    ...invoice,
    invoiceCode: invoice.invoiceCode.trim().toUpperCase(),
    tenantId: invoice.tenantId.trim(),
    companyName: invoice.companyName.trim(),
    workspaceCode: normalizeWorkspaceCode(invoice.workspaceCode),
    tenantOwnerEmail: normalizeOwnerEmail(invoice.tenantOwnerEmail),
    planCode: normalizePlanCode(invoice.planCode),
    billingPeriodLabel: invoice.billingPeriodLabel.trim(),
    status: normalizedStatus,
    amountVnd: Math.max(
      0,
      normalizePositiveInteger(invoice.baseAmountVnd) +
        normalizePositiveInteger(invoice.additionalSeatFeeVnd) -
        normalizePositiveInteger(invoice.discountVnd),
    ),
    baseAmountVnd: normalizePositiveInteger(invoice.baseAmountVnd),
    discountVnd: normalizePositiveInteger(invoice.discountVnd),
    additionalSeatFeeVnd: normalizePositiveInteger(invoice.additionalSeatFeeVnd),
    paymentGatewayRef: invoice.paymentGatewayRef?.trim() || undefined,
    paymentSource: invoice.paymentSource,
    summaryNote: invoice.summaryNote.trim(),
    draftLeadDays: normalizePositiveInteger(invoice.draftLeadDays || 0),
    gracePeriodDays,
    graceEndsAt: invoice.graceEndsAt ?? fallbackGraceEndsAt,
    pdfFileName: invoice.pdfFileName.trim() || `${invoice.invoiceCode}.pdf`,
  };
};

const normalizeSnapshot = (snapshot: ControlPlaneSnapshot): ControlPlaneSnapshot => {
  const plans = snapshot.plans.map(normalizeSubscriptionPlan);
  const planIndex = new Map(plans.map((plan) => [plan.code, plan]));
  const invoices = snapshot.invoices.map(normalizeInvoice);
  const tenantIndex = new Map(
    snapshot.tenants.map((tenant) => [normalizeWorkspaceCode(tenant.workspaceCode), tenant]),
  );
  const supportGrants = snapshot.supportGrants
    .map((grant) =>
      normalizeSupportGrant(
        grant,
        tenantIndex.get(normalizeWorkspaceCode(grant.workspaceCode)),
      ),
    )
    .sort((left, right) => supportSortTimestamp(right) - supportSortTimestamp(left));
  const latestInvoiceByWorkspace = new Map<string, InvoiceMetadata>();
  const latestSupportByWorkspace = new Map<string, SupportGrant>();

  invoices.forEach((invoice) => {
    const current = latestInvoiceByWorkspace.get(invoice.workspaceCode);
    if (!current) {
      latestInvoiceByWorkspace.set(invoice.workspaceCode, invoice);
      return;
    }

    const currentTime = Date.parse(current.issuedAt);
    const nextTime = Date.parse(invoice.issuedAt);
    if (Number.isNaN(currentTime) || nextTime >= currentTime) {
      latestInvoiceByWorkspace.set(invoice.workspaceCode, invoice);
    }
  });

  supportGrants.forEach((grant) => {
    const workspaceCode = normalizeWorkspaceCode(grant.workspaceCode);
    const current = latestSupportByWorkspace.get(workspaceCode);
    if (!current || supportSortTimestamp(grant) >= supportSortTimestamp(current)) {
      latestSupportByWorkspace.set(workspaceCode, grant);
    }
  });

  return {
    ...snapshot,
    plans,
    invoices,
    supportGrants,
    tenants: snapshot.tenants.map((tenant) => {
      const plan = planIndex.get(normalizePlanCode(tenant.planCode));
      const latestInvoice = latestInvoiceByWorkspace.get(
        normalizeWorkspaceCode(tenant.workspaceCode),
      );
      const latestSupport = latestSupportByWorkspace.get(
        normalizeWorkspaceCode(tenant.workspaceCode),
      );
      const graceExpired =
        latestInvoice?.status === "overdue" &&
        Boolean(latestInvoice.graceEndsAt) &&
        Date.parse(latestInvoice.graceEndsAt as string) <= Date.now();

      const nextSubscriptionStatus = graceExpired
        ? "suspended"
        : latestInvoice?.status === "overdue" && tenant.subscriptionStatus !== "trial"
          ? "past_due"
          : tenant.subscriptionStatus;

      if (!plan) {
        return {
          ...tenant,
          planCode: normalizePlanCode(tenant.planCode),
          billingStatus: latestInvoice?.status ?? tenant.billingStatus,
          lastInvoiceCode: latestInvoice?.invoiceCode ?? tenant.lastInvoiceCode,
          subscriptionStatus: nextSubscriptionStatus,
          supportAccessStatus: latestSupport?.status ?? tenant.supportAccessStatus,
          supportAccessExpiresAt: latestSupport?.expiresAt ?? tenant.supportAccessExpiresAt,
          supportTicketId: latestSupport?.ticketId ?? tenant.supportTicketId,
        };
      }

      return {
        ...tenant,
        planCode: plan.code,
        planName: plan.name,
        storageLimitGb: plan.storageLimitGb,
        billingStatus: latestInvoice?.status ?? tenant.billingStatus,
        lastInvoiceCode: latestInvoice?.invoiceCode ?? tenant.lastInvoiceCode,
        subscriptionStatus: nextSubscriptionStatus,
        supportAccessStatus: latestSupport?.status ?? tenant.supportAccessStatus,
        supportAccessExpiresAt: latestSupport?.expiresAt ?? tenant.supportAccessExpiresAt,
        supportTicketId: latestSupport?.ticketId ?? tenant.supportTicketId,
      };
    }),
    workspaceOwners: snapshot.workspaceOwners.map((owner) => {
      const plan = planIndex.get(normalizePlanCode(owner.planCode));
      return normalizeWorkspaceOwner(
        plan
          ? {
              ...owner,
              planCode: plan.code,
              planName: plan.name,
            }
          : owner,
      );
    }),
  };
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

const isSnapshotPayload = (value: unknown): value is ControlPlaneSnapshot =>
  isRecord(value) &&
  Array.isArray(value.tenants) &&
  Array.isArray(value.plans) &&
  Array.isArray(value.invoices) &&
  Array.isArray(value.supportGrants) &&
  Array.isArray(value.workspaceOwners);

const extractSnapshot = (payload: unknown): ControlPlaneSnapshot | null => {
  if (isSnapshotPayload(payload)) {
    return payload;
  }

  if (isRecord(payload) && isSnapshotPayload(payload.snapshot)) {
    return payload.snapshot;
  }

  return null;
};

const extractMutationResult = <T,>(
  payload: unknown,
): PortalMutationResult<T> | null => {
  if (
    isRecord(payload) &&
    typeof payload.success === "boolean" &&
    typeof payload.message === "string" &&
    isSnapshotPayload(payload.snapshot)
  ) {
    return {
      success: payload.success,
      message: payload.message,
      snapshot: payload.snapshot,
      record: payload.record as T | undefined,
    };
  }

  return null;
};

const extractTenantList = (payload: unknown): TenantSubscription[] | null => {
  if (Array.isArray(payload)) {
    return payload as TenantSubscription[];
  }

  if (isRecord(payload)) {
    if (Array.isArray(payload.tenants)) {
      return payload.tenants as TenantSubscription[];
    }

    if (Array.isArray(payload.items)) {
      return payload.items as TenantSubscription[];
    }
  }

  return null;
};

const extractPlansList = (payload: unknown): SubscriptionPlan[] | null => {
  if (Array.isArray(payload)) {
    return payload as SubscriptionPlan[];
  }

  if (isRecord(payload)) {
    if (Array.isArray(payload.plans)) {
      return payload.plans as SubscriptionPlan[];
    }

    if (Array.isArray(payload.items)) {
      return payload.items as SubscriptionPlan[];
    }
  }

  return null;
};

const extractSupportList = (payload: unknown): SupportGrant[] | null => {
  if (Array.isArray(payload)) {
    return payload as SupportGrant[];
  }

  if (isRecord(payload)) {
    if (Array.isArray(payload.supportGrants)) {
      return payload.supportGrants as SupportGrant[];
    }

    if (Array.isArray(payload.items)) {
      return payload.items as SupportGrant[];
    }
  }

  return null;
};

const extractBillingPage = (payload: unknown): BillingListPage | null => {
  if (isRecord(payload) && Array.isArray(payload.items)) {
    const total = typeof payload.total === "number" ? payload.total : payload.items.length;
    const page = typeof payload.page === "number" ? payload.page : 1;
    const pageSize =
      typeof payload.pageSize === "number" ? payload.pageSize : payload.items.length;

    return {
      items: payload.items as InvoiceMetadata[],
      total,
      page,
      pageSize,
      totalPages: Math.max(1, Math.ceil(total / Math.max(1, pageSize))),
    };
  }

  if (Array.isArray(payload)) {
    const items = payload as InvoiceMetadata[];
    return {
      items,
      total: items.length,
      page: 1,
      pageSize: items.length || DEFAULT_BILLING_PAGE_SIZE,
      totalPages: 1,
    };
  }

  return null;
};

const portalRequest = async <T,>(
  url: string,
  init: RequestInit,
): Promise<T> => {
  try {
    const response = await authFetch(url, init);

    if (!response.ok) {
      if ([404, 405, 501].includes(response.status)) {
        throw new PortalApiError(
          `Control-plane endpoint ${url} is not available yet.`,
          true,
        );
      }

      const errorPayload = await readJsonSafely<{ message?: string }>(response);
      throw new PortalApiError(
        errorPayload?.message ||
          `Control-plane request failed with status ${response.status}.`,
        false,
      );
    }

    const payload = await readJsonSafely<T>(response);
    if (payload === null) {
      throw new PortalApiError("Control-plane endpoint returned an empty response.", true);
    }

    return payload;
  } catch (error) {
    if (error instanceof PortalApiError) {
      throw error;
    }

    throw new PortalApiError(
      `Unable to reach control-plane endpoint ${url}.`,
      true,
    );
  }
};

const filterTenantDirectory = (
  tenants: TenantSubscription[],
  query: TenantDirectoryQuery,
): TenantSubscription[] => {
  const normalizedSearch = query.search?.trim().toLowerCase() ?? "";
  const normalizedStatus = query.subscriptionStatus ?? "all";

  return tenants.filter((tenant) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      tenant.companyName.toLowerCase().includes(normalizedSearch) ||
      tenant.workspaceCode.toLowerCase().includes(normalizedSearch) ||
      tenant.portalAdminEmail.toLowerCase().includes(normalizedSearch) ||
      tenant.lastInvoiceCode.toLowerCase().includes(normalizedSearch) ||
      tenant.planCode.toLowerCase().includes(normalizedSearch) ||
      tenant.planName.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      normalizedStatus === "all" || tenant.subscriptionStatus === normalizedStatus;

    return matchesSearch && matchesStatus;
  });
};

const filterPlansCatalog = (
  plans: SubscriptionPlan[],
  query: PlanCatalogQuery,
): SubscriptionPlan[] => {
  const normalizedSearch = query.search?.trim().toLowerCase() ?? "";
  const normalizedStatus = query.status ?? "all";

  return plans.filter((plan) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      plan.code.toLowerCase().includes(normalizedSearch) ||
      plan.name.toLowerCase().includes(normalizedSearch) ||
      plan.description.toLowerCase().includes(normalizedSearch) ||
      plan.supportSla.toLowerCase().includes(normalizedSearch) ||
      plan.modules.some((module) => module.toLowerCase().includes(normalizedSearch));

    const matchesStatus =
      normalizedStatus === "all" || plan.status === normalizedStatus;

    return matchesSearch && matchesStatus;
  });
};

const filterBillingCatalog = (
  invoices: InvoiceMetadata[],
  query: BillingListQuery,
): BillingListPage => {
  const normalizedSearch = query.search?.trim().toLowerCase() ?? "";
  const normalizedStatus = query.status ?? "all";
  const pageSize = Math.max(1, query.pageSize ?? DEFAULT_BILLING_PAGE_SIZE);
  const requestedPage = Math.max(1, query.page ?? 1);

  const filtered = invoices.filter((invoice) => {
    const matchesSearch =
      normalizedSearch.length === 0 ||
      invoice.invoiceCode.toLowerCase().includes(normalizedSearch) ||
      invoice.workspaceCode.toLowerCase().includes(normalizedSearch) ||
      invoice.companyName.toLowerCase().includes(normalizedSearch);

    const matchesStatus =
      normalizedStatus === "all" || invoice.status === normalizedStatus;

    return matchesSearch && matchesStatus;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(requestedPage, totalPages);
  const startIndex = (page - 1) * pageSize;

  return {
    items: filtered.slice(startIndex, startIndex + pageSize),
    total,
    page,
    pageSize,
    totalPages,
  };
};

const filterSupportTickets = (
  grants: SupportGrant[],
  query: SupportTicketQuery,
): SupportGrant[] => {
  const normalizedSearch = query.search?.trim().toLowerCase() ?? "";
  const normalizedStatus = query.status ?? "all";

  return grants
    .filter((grant) => {
      const matchesSearch =
        normalizedSearch.length === 0 ||
        grant.ticketId.toLowerCase().includes(normalizedSearch) ||
        grant.workspaceCode.toLowerCase().includes(normalizedSearch) ||
        grant.companyName.toLowerCase().includes(normalizedSearch) ||
        grant.requestedScope.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        normalizedStatus === "all" || grant.status === normalizedStatus;

      return matchesSearch && matchesStatus;
    })
    .sort((left, right) => supportSortTimestamp(right) - supportSortTimestamp(left));
};

const escapePdfText = (value: string): string =>
  value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const createMockInvoicePdfBlob = (invoice: InvoiceMetadata): Blob => {
  const content = [
    "BT",
    "/F1 18 Tf",
    "50 790 Td",
    `(${escapePdfText(invoice.invoiceCode)}) Tj`,
    "0 -28 Td",
    "/F1 12 Tf",
    `(${escapePdfText(`${invoice.companyName} - ${invoice.workspaceCode}`)}) Tj`,
    "0 -22 Td",
    `(${escapePdfText(`Amount: ${invoice.amountVnd} VND`)}) Tj`,
    "0 -22 Td",
    `(${escapePdfText(`Status: ${invoice.status}`)}) Tj`,
    "0 -22 Td",
    `(${escapePdfText(`Period: ${invoice.billingPeriodLabel}`)}) Tj`,
    "0 -22 Td",
    `(${escapePdfText(`Issued: ${invoice.issuedAt}`)}) Tj`,
    "0 -22 Td",
    `(${escapePdfText(`Due: ${invoice.dueAt}`)}) Tj`,
    "ET",
  ].join("\n");

  const objects = [
    "1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj",
    "2 0 obj << /Type /Pages /Count 1 /Kids [3 0 R] >> endobj",
    "3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj",
    `4 0 obj << /Length ${content.length} >> stream\n${content}\nendstream\nendobj`,
    "5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj",
  ];

  let pdfBody = "%PDF-1.4\n";
  const offsets: number[] = [0];

  objects.forEach((objectBody) => {
    offsets.push(pdfBody.length);
    pdfBody += `${objectBody}\n`;
  });

  const xrefStart = pdfBody.length;
  pdfBody += `xref\n0 ${objects.length + 1}\n`;
  pdfBody += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdfBody += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdfBody += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdfBody += `startxref\n${xrefStart}\n%%EOF`;

  return new Blob([pdfBody], { type: "application/pdf" });
};

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

let portalStore: ControlPlaneSnapshot = normalizeSnapshot({
  tenants: clone(initialTenants),
  plans: clone(subscriptionPlans),
  invoices: clone(invoiceMetadata),
  supportGrants: clone(initialSupportGrants),
  workspaceOwners: clone(workspaceOwnersSeed),
});

const getSnapshot = (): ControlPlaneSnapshot => normalizeSnapshot(clone(portalStore));

const createTenantRecord = (
  input: WorkspaceOwnerCreateInput,
  plan: SubscriptionPlan,
): TenantSubscription => {
  const now = new Date();
  const renewal = addDays(now, 14);
  const workspaceCode = normalizeWorkspaceCode(input.workspaceCode);

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
    nextRenewalAt: renewal,
    portalAdminEmail: normalizeOwnerEmail(input.ownerEmail),
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

const countTenantsUsingPlan = (planCode: string): number =>
  portalStore.tenants.filter((tenant) => tenant.planCode === planCode).length;

const validatePlanInput = (
  input: SubscriptionPlanInput,
  planId?: string,
): string | null => {
  const code = normalizePlanCode(input.code);
  const name = input.name.trim();
  const description = input.description.trim();
  const supportSla = input.supportSla.trim();
  const modules = Array.from(
    new Set(input.modules.map((module) => module.trim()).filter(Boolean)),
  );

  if (!code || !name || !description || !supportSla) {
    return "Vui lòng nhập đầy đủ thông tin chung và giới hạn tài nguyên của gói dịch vụ.";
  }

  if (!PLAN_CODE_PATTERN.test(code)) {
    return "Mã gói chỉ được chứa chữ in hoa, số hoặc dấu gạch ngang.";
  }

  if (modules.length === 0) {
    return "Vui lòng chọn ít nhất một tính năng cho gói dịch vụ.";
  }

  const numericFields = [
    input.monthlyPriceVnd,
    input.storageLimitGb,
    input.adminSeatLimit,
    input.employeeSeatLimit,
  ];

  if (
    numericFields.some(
      (value) => !Number.isFinite(value) || Number.isNaN(value) || value < 0,
    )
  ) {
    return "Các trường số không được âm và phải là giá trị hợp lệ.";
  }

  const duplicatedPlan = portalStore.plans.find(
    (plan) => plan.code === code && plan.id !== planId,
  );

  if (duplicatedPlan) {
    return `Mã gói ${code} đã tồn tại trong danh mục hiện tại.`;
  }

  return null;
};

const createNormalizedPlan = (
  input: SubscriptionPlanInput,
  planId?: string,
): SubscriptionPlan =>
  normalizeSubscriptionPlan({
    id: planId ?? `plan-${normalizePlanCode(input.code).toLowerCase()}`,
    code: input.code,
    name: input.name,
    description: input.description,
    status: input.status,
    monthlyPriceVnd: input.monthlyPriceVnd,
    storageLimitGb: input.storageLimitGb,
    adminSeatLimit: input.adminSeatLimit,
    employeeSeatLimit: input.employeeSeatLimit,
    supportSla: input.supportSla,
    modules: input.modules,
    highlight: input.highlight,
  });

const createMockSubscriptionPlan = (
  input: SubscriptionPlanInput,
): PortalMutationResult<SubscriptionPlan> => {
  const validationMessage = validatePlanInput(input);
  if (validationMessage) {
    return {
      success: false,
      message: validationMessage,
      snapshot: getSnapshot(),
    };
  }

  const plan = createNormalizedPlan(input);
  portalStore.plans = [plan, ...portalStore.plans];
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã tạo gói dịch vụ ${plan.code} và làm mới danh mục cấu hình.`,
    snapshot: getSnapshot(),
    record: plan,
  };
};

const updateMockSubscriptionPlan = (
  planId: string,
  input: SubscriptionPlanInput,
): PortalMutationResult<SubscriptionPlan> => {
  const currentPlan = portalStore.plans.find((plan) => plan.id === planId);
  if (!currentPlan) {
    return {
      success: false,
      message: "Không tìm thấy gói dịch vụ cần cập nhật.",
      snapshot: getSnapshot(),
    };
  }

  const validationMessage = validatePlanInput(input, planId);
  if (validationMessage) {
    return {
      success: false,
      message: validationMessage,
      snapshot: getSnapshot(),
      record: normalizeSubscriptionPlan(currentPlan),
    };
  }

  const nextPlan = createNormalizedPlan(input, currentPlan.id);
  const previousPlanCode = currentPlan.code;

  portalStore.plans = portalStore.plans.map((plan) =>
    plan.id === planId ? nextPlan : plan,
  );
  portalStore.tenants = portalStore.tenants.map((tenant) =>
    tenant.planCode === previousPlanCode
      ? {
          ...tenant,
          planCode: nextPlan.code,
          planName: nextPlan.name,
          storageLimitGb: nextPlan.storageLimitGb,
        }
      : tenant,
  );
  portalStore.workspaceOwners = portalStore.workspaceOwners.map((owner) =>
    owner.planCode === previousPlanCode
      ? {
          ...owner,
          planCode: nextPlan.code,
          planName: nextPlan.name,
        }
      : owner,
  );
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message:
      nextPlan.status === "hidden"
        ? `Đã cập nhật gói ${nextPlan.code} và chuyển sang trạng thái Ẩn.`
        : `Đã cập nhật cấu hình gói ${nextPlan.code}.`,
    snapshot: getSnapshot(),
    record: nextPlan,
  };
};

const deleteMockSubscriptionPlan = (
  planId: string,
): PortalMutationResult<SubscriptionPlan> => {
  const plan = portalStore.plans.find((item) => item.id === planId);
  if (!plan) {
    return {
      success: false,
      message: "Không tìm thấy gói dịch vụ cần xóa.",
      snapshot: getSnapshot(),
    };
  }

  const activeTenantCount = countTenantsUsingPlan(plan.code);
  if (activeTenantCount > 0) {
    return {
      success: false,
      message: `Không thể xóa gói dịch vụ này vì đang có ${activeTenantCount} khách hàng sử dụng. Vui lòng chuyển đổi gói cho khách hàng trước, hoặc chuyển gói này sang trạng thái Ẩn.`,
      snapshot: getSnapshot(),
      record: normalizeSubscriptionPlan(plan),
    };
  }

  portalStore.plans = portalStore.plans.filter((item) => item.id !== planId);
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã xóa vĩnh viễn gói dịch vụ ${plan.code} khỏi danh mục Control Plane.`,
    snapshot: getSnapshot(),
    record: normalizeSubscriptionPlan(plan),
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

const validateWorkspaceOwnerInput = (
  input: WorkspaceOwnerCreateInput,
): string | null => {
  const companyName = input.companyName.trim();
  const workspaceCode = normalizeWorkspaceCode(input.workspaceCode);
  const ownerEmail = normalizeOwnerEmail(input.ownerEmail);
  const ownerFullName = input.ownerFullName.trim();

  if (!companyName || !workspaceCode || !ownerEmail || !ownerFullName) {
    return "Vui lòng nhập đầy đủ các trường bắt buộc trước khi tạo lời mời.";
  }

  if (!WORKSPACE_CODE_PATTERN.test(workspaceCode)) {
    return "Mã Workspace chỉ được chứa chữ in hoa, số hoặc dấu gạch ngang.";
  }

  if (!EMAIL_PATTERN.test(ownerEmail)) {
    return "Email chủ sở hữu chưa đúng định dạng.";
  }

  if (
    portalStore.tenants.some((tenant) => tenant.workspaceCode === workspaceCode) ||
    portalStore.workspaceOwners.some((owner) => owner.workspaceCode === workspaceCode)
  ) {
    return `Mã Workspace ${workspaceCode} đã tồn tại hoặc đang nằm trong hàng chờ kích hoạt.`;
  }

  if (
    portalStore.workspaceOwners.some((owner) => owner.ownerEmail === ownerEmail) ||
    portalStore.tenants.some((tenant) => tenant.portalAdminEmail === ownerEmail)
  ) {
    return `Email ${ownerEmail} đã được gán cho một Workspace khác.`;
  }

  return null;
};

const createMockWorkspaceOwner = (
  input: WorkspaceOwnerCreateInput,
): PortalMutationResult<WorkspaceOwnerProvisioning> => {
  const validationMessage = validateWorkspaceOwnerInput(input);
  if (validationMessage) {
    return {
      success: false,
      message: validationMessage,
      snapshot: getSnapshot(),
    };
  }

  const plan = portalStore.plans.find((item) => item.code === input.planCode);
  if (!plan) {
    return {
      success: false,
      message: "Không tìm thấy gói dịch vụ đã chọn trong metadata hiện tại.",
      snapshot: getSnapshot(),
    };
  }

  if (plan.status !== "active") {
    return {
      success: false,
      message: `Gói dịch vụ ${plan.code} đang ở trạng thái Ẩn và không thể dùng cho onboarding mới.`,
      snapshot: getSnapshot(),
    };
  }

  const now = new Date();
  const workspaceCode = normalizeWorkspaceCode(input.workspaceCode);
  const token = generateActivationToken(workspaceCode);
  const owner: WorkspaceOwnerProvisioning = normalizeWorkspaceOwner({
    id: `owner-${workspaceCode.toLowerCase()}`,
    companyName: input.companyName.trim(),
    workspaceCode,
    ownerFullName: input.ownerFullName.trim(),
    ownerEmail: normalizeOwnerEmail(input.ownerEmail),
    ownerPhone: input.ownerPhone.trim(),
    planCode: plan.code,
    planName: plan.name,
    billingCycle: input.billingCycle,
    status: "invited",
    invitedAt: now.toISOString(),
    lastSentAt: now.toISOString(),
    expiresAt: addDays(now, 4),
    invitedBy: "admin@nexahrm.com",
    note: input.note?.trim() || undefined,
    activationToken: token,
    activationLink: createActivationLink(token),
    adminDashboardUrl: ACTIVATION_BASE_URL,
    securityBoundary: "owner-sets-password",
  });

  portalStore.workspaceOwners = [owner, ...portalStore.workspaceOwners];
  portalStore.tenants = [createTenantRecord(input, plan), ...portalStore.tenants];
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message:
      "Đã tạo lời mời kích hoạt, sinh token có thời hạn và xếp email kích hoạt vào hàng đợi gửi.",
    snapshot: getSnapshot(),
    record: owner,
  };
};

const resendMockWorkspaceOwnerInvite = (
  ownerId: string,
): PortalMutationResult<WorkspaceOwnerProvisioning> => {
  const owner = portalStore.workspaceOwners.find((item) => item.id === ownerId);
  if (!owner) {
    return {
      success: false,
      message: "Không tìm thấy lời mời kích hoạt cần gửi lại.",
      snapshot: getSnapshot(),
    };
  }

  const resolvedStatus = resolveWorkspaceOwnerStatus(owner);
  if (resolvedStatus === "revoked") {
    return {
      success: false,
      message: "Lời mời này đã bị thu hồi và không thể gửi lại.",
      snapshot: getSnapshot(),
      record: normalizeWorkspaceOwner(owner),
    };
  }

  if (resolvedStatus === "activated") {
    return {
      success: false,
      message: "Workspace Owner đã kích hoạt thành công nên không cần gửi lại lời mời.",
      snapshot: getSnapshot(),
      record: normalizeWorkspaceOwner(owner),
    };
  }

  const now = new Date();
  const shouldRotateToken =
    resolvedStatus === "expired" || !owner.activationToken || !owner.activationLink;

  if (shouldRotateToken) {
    const nextToken = generateActivationToken(owner.workspaceCode);
    owner.activationToken = nextToken;
    owner.activationLink = createActivationLink(nextToken);
    owner.expiresAt = addDays(now, 4);
  }

  owner.status = "invited";
  owner.lastSentAt = now.toISOString();
  delete owner.revokedAt;
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: shouldRotateToken
      ? `Đã tạo token mới, cập nhật hạn kích hoạt và gửi lại email cho ${owner.ownerEmail}.`
      : `Đã gửi lại email kích hoạt cho ${owner.ownerEmail}.`,
    snapshot: getSnapshot(),
    record: normalizeWorkspaceOwner(owner),
  };
};

const revokeMockWorkspaceOwnerInvite = (
  ownerId: string,
): PortalMutationResult<WorkspaceOwnerProvisioning> => {
  const owner = portalStore.workspaceOwners.find((item) => item.id === ownerId);
  if (!owner) {
    return {
      success: false,
      message: "Không tìm thấy lời mời kích hoạt cần thu hồi.",
      snapshot: getSnapshot(),
    };
  }

  const resolvedStatus = resolveWorkspaceOwnerStatus(owner);
  if (resolvedStatus === "activated") {
    return {
      success: false,
      message: "Workspace Owner đã kích hoạt, nên không thể thu hồi lời mời đã hoàn tất.",
      snapshot: getSnapshot(),
      record: normalizeWorkspaceOwner(owner),
    };
  }

  owner.status = "revoked";
  owner.revokedAt = new Date().toISOString();
  owner.activationToken = "";
  owner.activationLink = "";
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã thu hồi lời mời và vô hiệu hóa token kích hoạt của Workspace ${owner.workspaceCode}.`,
    snapshot: getSnapshot(),
    record: normalizeWorkspaceOwner(owner),
  };
};

const findTenantByWorkspace = (workspaceCode: string) =>
  portalStore.tenants.find(
    (tenant) => tenant.workspaceCode === normalizeWorkspaceCode(workspaceCode),
  );

const syncTenantAfterInvoiceMutation = (
  invoice: InvoiceMetadata,
  nextStatus: BillingStatus,
) => {
  portalStore.tenants = portalStore.tenants.map((tenant) => {
    if (tenant.workspaceCode !== invoice.workspaceCode) {
      return tenant;
    }

    const nextTenant = {
      ...tenant,
      lastInvoiceCode: invoice.invoiceCode,
      billingStatus: nextStatus,
    };

    if (nextStatus === "paid") {
      return {
        ...nextTenant,
        subscriptionStatus: tenant.subscriptionStatus === "trial" ? "trial" : "active",
        nextRenewalAt: addBillingCycle(tenant.nextRenewalAt, tenant.billingCycle),
      };
    }

    if (
      nextStatus === "overdue" &&
      invoice.graceEndsAt &&
      Date.parse(invoice.graceEndsAt) <= Date.now()
    ) {
      return {
        ...nextTenant,
        subscriptionStatus: "suspended",
      };
    }

    if (nextStatus === "overdue" && tenant.subscriptionStatus !== "trial") {
      return {
        ...nextTenant,
        subscriptionStatus: "past_due",
      };
    }

    return nextTenant;
  });
};

const validateDraftInvoiceInput = (
  input: DraftInvoiceUpdateInput,
): string | null => {
  if (!input.summaryNote.trim()) {
    return "Vui lòng nhập ghi chú chi tiết gói cước trước khi lưu bản nháp.";
  }

  if (!input.dueAt || Number.isNaN(Date.parse(input.dueAt))) {
    return "Ngày đến hạn chưa hợp lệ.";
  }

  const discount = normalizePositiveInteger(input.discountVnd);
  const additionalFee = normalizePositiveInteger(input.additionalSeatFeeVnd);
  if (discount < 0 || additionalFee < 0) {
    return "Giảm giá và phí phát sinh không được âm.";
  }

  return null;
};

const markMockInvoicePaid = (
  invoiceId: string,
  input: ManualPaymentInput,
  paymentSource: PaymentTransactionSource = "manual",
): PortalMutationResult<InvoiceMetadata> => {
  const invoice = portalStore.invoices.find((item) => item.id === invoiceId);
  if (!invoice) {
    return {
      success: false,
      message: "Không tìm thấy hóa đơn cần xác nhận thanh toán.",
      snapshot: getSnapshot(),
    };
  }

  if (!["upcoming", "overdue"].includes(invoice.status)) {
    return {
      success: false,
      message: "Chỉ hóa đơn Sắp tới hoặc Quá hạn mới có thể được xác nhận thanh toán thủ công.",
      snapshot: getSnapshot(),
      record: normalizeInvoice(invoice),
    };
  }

  if (!input.paymentGatewayRef.trim()) {
    return {
      success: false,
      message: "Vui lòng nhập mã giao dịch trước khi xác nhận thanh toán.",
      snapshot: getSnapshot(),
      record: normalizeInvoice(invoice),
    };
  }

  if (!input.receivedAt || Number.isNaN(Date.parse(input.receivedAt))) {
    return {
      success: false,
      message: "Ngày nhận tiền chưa hợp lệ.",
      snapshot: getSnapshot(),
      record: normalizeInvoice(invoice),
    };
  }

  invoice.status = "paid";
  invoice.paymentGatewayRef = input.paymentGatewayRef.trim();
  invoice.paymentSource = paymentSource;
  invoice.receivedAt = new Date(input.receivedAt).toISOString();
  invoice.paidAt = invoice.receivedAt;
  invoice.graceEndsAt = addDays(new Date(invoice.dueAt), invoice.gracePeriodDays);
  syncTenantAfterInvoiceMutation(invoice, "paid");
  portalStore = normalizeSnapshot(portalStore);

  const tenant = findTenantByWorkspace(invoice.workspaceCode);
  const nextRenewalAt = tenant?.nextRenewalAt;

  return {
    success: true,
    message: `Đã ghi nhận thanh toán cho ${invoice.invoiceCode} và gia hạn tenant tới ${nextRenewalAt ? new Date(nextRenewalAt).toLocaleString("vi-VN") : "chu kỳ kế tiếp"}.`,
    snapshot: getSnapshot(),
    record: normalizeInvoice(invoice),
  };
};

const sendMockInvoiceReminder = (
  invoiceId: string,
): PortalMutationResult<InvoiceMetadata> => {
  const invoice = portalStore.invoices.find((item) => item.id === invoiceId);
  if (!invoice) {
    return {
      success: false,
      message: "Không tìm thấy hóa đơn cần gửi nhắc nợ.",
      snapshot: getSnapshot(),
    };
  }

  if (!["upcoming", "overdue"].includes(invoice.status)) {
    return {
      success: false,
      message: "Chỉ hóa đơn Sắp tới hoặc Quá hạn mới hỗ trợ gửi nhắc nợ.",
      snapshot: getSnapshot(),
      record: normalizeInvoice(invoice),
    };
  }

  invoice.reminderSentAt = new Date().toISOString();
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã gửi lại email nhắc thanh toán cho ${invoice.tenantOwnerEmail} (${invoice.invoiceCode}).`,
    snapshot: getSnapshot(),
    record: normalizeInvoice(invoice),
  };
};

const updateMockDraftInvoice = (
  invoiceId: string,
  input: DraftInvoiceUpdateInput,
): PortalMutationResult<InvoiceMetadata> => {
  const invoice = portalStore.invoices.find((item) => item.id === invoiceId);
  if (!invoice) {
    return {
      success: false,
      message: "Không tìm thấy hóa đơn nháp cần chỉnh sửa.",
      snapshot: getSnapshot(),
    };
  }

  if (invoice.status !== "draft") {
    return {
      success: false,
      message: "Chỉ hóa đơn ở trạng thái Bản nháp mới được chỉnh sửa.",
      snapshot: getSnapshot(),
      record: normalizeInvoice(invoice),
    };
  }

  const validationMessage = validateDraftInvoiceInput(input);
  if (validationMessage) {
    return {
      success: false,
      message: validationMessage,
      snapshot: getSnapshot(),
      record: normalizeInvoice(invoice),
    };
  }

  invoice.discountVnd = normalizePositiveInteger(input.discountVnd);
  invoice.additionalSeatFeeVnd = normalizePositiveInteger(input.additionalSeatFeeVnd);
  invoice.amountVnd = Math.max(
    0,
    invoice.baseAmountVnd + invoice.additionalSeatFeeVnd - invoice.discountVnd,
  );
  invoice.summaryNote = input.summaryNote.trim();
  invoice.dueAt = new Date(input.dueAt).toISOString();
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã cập nhật bản nháp ${invoice.invoiceCode}. Kế toán có thể tiếp tục chốt trước khi gửi cho khách hàng.`,
    snapshot: getSnapshot(),
    record: normalizeInvoice(invoice),
  };
};

const cancelMockDraftInvoice = (
  invoiceId: string,
): PortalMutationResult<InvoiceMetadata> => {
  const invoice = portalStore.invoices.find((item) => item.id === invoiceId);
  if (!invoice) {
    return {
      success: false,
      message: "Không tìm thấy hóa đơn nháp cần hủy.",
      snapshot: getSnapshot(),
    };
  }

  if (invoice.status !== "draft") {
    return {
      success: false,
      message: "Chỉ hóa đơn ở trạng thái Bản nháp mới được hủy.",
      snapshot: getSnapshot(),
      record: normalizeInvoice(invoice),
    };
  }

  portalStore.invoices = portalStore.invoices.filter((item) => item.id !== invoiceId);
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã hủy bản nháp ${invoice.invoiceCode} khỏi hàng chờ phát hành.`,
    snapshot: getSnapshot(),
    record: normalizeInvoice(invoice),
  };
};

const processMockPaymentGatewayWebhook = (
  input: PaymentGatewayWebhookInput,
): PortalMutationResult<InvoiceMetadata> => {
  const invoice = portalStore.invoices.find((item) =>
    input.invoiceId ? item.id === input.invoiceId : item.invoiceCode === input.invoiceCode,
  );

  if (!invoice) {
    return {
      success: false,
      message: "Webhook không khớp với hóa đơn nào trong metadata Control Plane.",
      snapshot: getSnapshot(),
    };
  }

  return markMockInvoicePaid(
    invoice.id,
    {
      paymentGatewayRef: input.paymentGatewayRef,
      receivedAt: input.paidAt,
    },
    input.source,
  );
};

const validateSupportTicketInput = (
  input: SupportTicketCreateInput,
): { tenant: TenantSubscription | null; message: string | null } => {
  const tenant =
    portalStore.tenants.find((item) => item.id === input.tenantId) ??
    portalStore.tenants.find(
      (item) => item.workspaceCode === normalizeWorkspaceCode(input.tenantId),
    ) ??
    null;

  if (!tenant) {
    return {
      tenant: null,
      message: "Không tìm thấy Tenant cần xin quyền hỗ trợ.",
    };
  }

  if (!input.requestedScope.trim()) {
    return {
      tenant,
      message: "Vui lòng nhập lý do xin quyền hỗ trợ trước khi gửi ticket.",
    };
  }

  if (normalizePositiveInteger(input.durationHours) <= 0) {
    return {
      tenant,
      message: "Thời lượng xin quyền phải lớn hơn 0 giờ.",
    };
  }

  const openTicket = portalStore.supportGrants.find(
    (grant) =>
      normalizeWorkspaceCode(grant.workspaceCode) === tenant.workspaceCode &&
      ["pending_customer_approval", "granted"].includes(grant.status),
  );

  if (openTicket) {
    return {
      tenant,
      message: `Tenant ${tenant.workspaceCode} đang có ticket ${openTicket.ticketId} chưa kết thúc. Vui lòng xử lý ticket hiện tại trước khi tạo yêu cầu mới.`,
    };
  }

  return { tenant, message: null };
};

const createMockSupportTicket = (
  input: SupportTicketCreateInput,
): PortalMutationResult<SupportGrant> => {
  const { tenant, message } = validateSupportTicketInput(input);
  if (!tenant || message) {
    return {
      success: false,
      message: message ?? "Không thể tạo yêu cầu hỗ trợ cho tenant đã chọn.",
      snapshot: getSnapshot(),
    };
  }

  const requestedAt = new Date().toISOString();
  const requestedBy = input.requestedBy?.trim() || "NexaHR Super Admin";
  const ticket = normalizeSupportGrant(
    {
      ticketId: generateSupportTicketCode(),
      tenantId: tenant.id,
      companyName: tenant.companyName,
      workspaceCode: tenant.workspaceCode,
      tenantOwnerEmail: tenant.portalAdminEmail,
      requestedAt,
      requestedBy,
      requestedDurationHours: normalizePositiveInteger(input.durationHours),
      requestedScope: input.requestedScope.trim(),
      status: "pending_customer_approval",
      note:
        "Quyền truy cập hỗ trợ bị khóa theo mặc định. Ticket sẽ chỉ được kích hoạt sau khi Tenant Owner phê duyệt trên ứng dụng khách hàng.",
      lastNotifiedAt: requestedAt,
      auditActorLabel: `Hệ thống hỗ trợ - ${requestedBy}`,
    },
    tenant,
  );

  portalStore.supportGrants = [ticket, ...portalStore.supportGrants];
  updateSupportStatusOnTenant(
    ticket.workspaceCode,
    "pending_customer_approval",
    undefined,
    ticket.ticketId,
  );
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã tạo ${ticket.ticketId} và gửi email/notification xin quyền hỗ trợ tới ${tenant.portalAdminEmail}.`,
    snapshot: getSnapshot(),
    record: ticket,
  };
};

const activateMockSupportSession = (
  ticketId: string,
): PortalMutationResult<SupportGrant> => {
  const grant = portalStore.supportGrants.find((item) => item.ticketId === ticketId);
  if (!grant) {
    return {
      success: false,
      message: "Không tìm thấy Support Ticket cần kích hoạt.",
      snapshot: getSnapshot(),
    };
  }

  if (!grant.customerApprovedAt) {
    return {
      success: false,
      message:
        "Khách hàng chưa phê duyệt Support Ticket, nên Control Plane phải tiếp tục khóa quyền truy cập.",
      snapshot: getSnapshot(),
      record: normalizeSupportGrant(grant),
    };
  }

  if (grant.status === "granted" && grant.expiresAt && !isTimestampExpired(grant.expiresAt)) {
    return {
      success: false,
      message: `Phiên hỗ trợ ${grant.ticketId} đang còn hiệu lực tới ${new Date(
        grant.expiresAt,
      ).toLocaleString("vi-VN")}.`,
      snapshot: getSnapshot(),
      record: normalizeSupportGrant(grant),
    };
  }

  const activatedAt = new Date();
  const expiresAt = addHours(activatedAt, Math.max(1, grant.requestedDurationHours || 1));
  const impersonationToken = generateImpersonationToken(grant.ticketId, grant.workspaceCode);

  grant.status = "granted";
  grant.activatedAt = activatedAt.toISOString();
  grant.expiresAt = expiresAt;
  grant.revokedAt = undefined;
  grant.lastNotifiedAt = activatedAt.toISOString();
  grant.impersonationToken = impersonationToken;
  grant.sessionLaunchUrl = createSupportSessionUrl(
    grant.workspaceCode,
    grant.ticketId,
    impersonationToken,
  );
  updateSupportStatusOnTenant(grant.workspaceCode, "granted", expiresAt, grant.ticketId);
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã phát hành impersonation token cho ${grant.workspaceCode} và sẵn sàng mở phiên hỗ trợ tới ${new Date(
      expiresAt,
    ).toLocaleString("vi-VN")}.`,
    snapshot: getSnapshot(),
    record: normalizeSupportGrant(grant),
  };
};

const revokeMockSupportSession = (
  ticketId: string,
): PortalMutationResult<SupportGrant> => {
  const grant = portalStore.supportGrants.find((item) => item.ticketId === ticketId);
  if (!grant) {
    return {
      success: false,
      message: "Không tìm thấy Support Ticket cần thu hồi.",
      snapshot: getSnapshot(),
    };
  }

  if (grant.status !== "granted") {
    return {
      success: false,
      message: "Chỉ phiên hỗ trợ đang hoạt động mới có thể thu hồi ngay lập tức.",
      snapshot: getSnapshot(),
      record: normalizeSupportGrant(grant),
    };
  }

  const revokedAt = new Date().toISOString();
  grant.status = "expired";
  grant.revokedAt = revokedAt;
  grant.expiresAt = revokedAt;
  grant.impersonationToken = undefined;
  grant.sessionLaunchUrl = undefined;
  grant.lastNotifiedAt = revokedAt;
  updateSupportStatusOnTenant(grant.workspaceCode, "expired", revokedAt, grant.ticketId);
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã thu hồi sớm phiên hỗ trợ ${grant.ticketId}; token impersonation đã bị vô hiệu hóa và UI được chuyển sang Hết hạn.`,
    snapshot: getSnapshot(),
    record: normalizeSupportGrant(grant),
  };
};

export const activateMockSupportGrant = (
  ticketId: string,
): PortalMutationResult<SupportGrant> => {
  const grant = portalStore.supportGrants.find((item) => item.ticketId === ticketId);
  if (!grant) {
    return {
      success: false,
      message: "Không tìm thấy Support Ticket cần kích hoạt.",
      snapshot: getSnapshot(),
    };
  }

  if (!grant.customerApprovedAt) {
    return {
      success: false,
      message:
        "Khách hàng chưa phê duyệt Support Ticket, nên Control Plane phải tiếp tục khóa quyền truy cập.",
      snapshot: getSnapshot(),
      record: grant,
    };
  }

  const expiresAt =
    grant.expiresAt ?? new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

  grant.status = "granted";
  grant.expiresAt = expiresAt;
  updateSupportStatusOnTenant(grant.workspaceCode, "granted", expiresAt, grant.ticketId);
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã kích hoạt phiên hỗ trợ cho ${grant.workspaceCode} tới ${new Date(
      expiresAt,
    ).toLocaleString("vi-VN")}.`,
    snapshot: getSnapshot(),
    record: grant,
  };
};

export const revokeMockSupportGrant = (
  ticketId: string,
): PortalMutationResult<SupportGrant> => {
  const grant = portalStore.supportGrants.find((item) => item.ticketId === ticketId);
  if (!grant) {
    return {
      success: false,
      message: "Không tìm thấy Support Ticket cần thu hồi.",
      snapshot: getSnapshot(),
    };
  }

  grant.status = "revoked";
  grant.expiresAt = undefined;
  updateSupportStatusOnTenant(grant.workspaceCode, "not_requested", undefined, undefined);
  portalStore = normalizeSnapshot(portalStore);

  return {
    success: true,
    message: `Đã thu hồi phiên hỗ trợ của ${grant.workspaceCode}.`,
    snapshot: getSnapshot(),
    record: grant,
  };
};

const logPortalFallback = (context: string, error: PortalApiError) => {
  console.warn(`[super-admin] ${context} is using mock fallback: ${error.message}`);
};

export const superAdminPortalService = {
  async fetchControlPlaneSnapshot(): Promise<ControlPlaneSnapshot> {
    try {
      const payload = await portalRequest<unknown>(CONTROL_PLANE_SNAPSHOT_URL, {
        method: "GET",
      });
      const snapshot = extractSnapshot(payload);
      if (snapshot) {
        return normalizeSnapshot(snapshot);
      }

      throw new PortalApiError(
        "Control-plane snapshot response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        logPortalFallback("fetchControlPlaneSnapshot", error);
      }

      return simulate(() => getSnapshot());
    }
  },

  async fetchTenantDirectory(query: TenantDirectoryQuery = {}): Promise<TenantSubscription[]> {
    const params = new URLSearchParams();
    const trimmedSearch = query.search?.trim();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    if (query.subscriptionStatus && query.subscriptionStatus !== "all") {
      params.set("subscriptionStatus", query.subscriptionStatus);
    }

    const requestUrl = params.size > 0
      ? `${TENANT_DIRECTORY_URL}?${params.toString()}`
      : TENANT_DIRECTORY_URL;

    try {
      const payload = await portalRequest<unknown>(requestUrl, { method: "GET" });
      const tenants = extractTenantList(payload);
      if (tenants) {
        return clone(tenants);
      }

      throw new PortalApiError(
        "Tenant directory response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        logPortalFallback("fetchTenantDirectory", error);
      }

      return simulate(() => filterTenantDirectory(getSnapshot().tenants, query));
    }
  },

  async fetchBillingCatalog(query: BillingListQuery = {}): Promise<BillingListPage> {
    const params = new URLSearchParams();
    const trimmedSearch = query.search?.trim();
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.max(1, query.pageSize ?? DEFAULT_BILLING_PAGE_SIZE);

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    if (query.status && query.status !== "all") {
      params.set("status", query.status);
    }

    params.set("page", String(page));
    params.set("pageSize", String(pageSize));

    const requestUrl = `${BILLING_URL}?${params.toString()}`;

    try {
      const payload = await portalRequest<unknown>(requestUrl, { method: "GET" });
      const billingPage = extractBillingPage(payload);
      if (billingPage) {
        return {
          ...billingPage,
          items: billingPage.items.map(normalizeInvoice),
        };
      }

      throw new PortalApiError(
        "Billing list response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        logPortalFallback("fetchBillingCatalog", error);
      }

      return simulate(() => filterBillingCatalog(getSnapshot().invoices, query));
    }
  },

  async fetchSupportTickets(query: SupportTicketQuery = {}): Promise<SupportGrant[]> {
    const params = new URLSearchParams();
    const trimmedSearch = query.search?.trim();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    if (query.status && query.status !== "all") {
      params.set("status", query.status);
    }

    const requestUrl =
      params.size > 0 ? `${SUPPORT_GRANT_URL}?${params.toString()}` : SUPPORT_GRANT_URL;

    try {
      const payload = await portalRequest<unknown>(requestUrl, { method: "GET" });
      const grants = extractSupportList(payload);
      if (grants) {
        const snapshot = getSnapshot();
        const tenantIndex = new Map(snapshot.tenants.map((tenant) => [tenant.id, tenant]));
        const tenantByWorkspace = new Map(
          snapshot.tenants.map((tenant) => [tenant.workspaceCode, tenant]),
        );

        return grants
          .map((grant) =>
            normalizeSupportGrant(
              grant,
              (grant.tenantId ? tenantIndex.get(grant.tenantId) : undefined) ??
                tenantByWorkspace.get(grant.workspaceCode),
            ),
          )
          .sort((left, right) => supportSortTimestamp(right) - supportSortTimestamp(left));
      }

      throw new PortalApiError(
        "Support tickets response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        logPortalFallback("fetchSupportTickets", error);
      }

      return simulate(() => filterSupportTickets(getSnapshot().supportGrants, query));
    }
  },

  async fetchPlansCatalog(query: PlanCatalogQuery = {}): Promise<SubscriptionPlan[]> {
    const params = new URLSearchParams();
    const trimmedSearch = query.search?.trim();

    if (trimmedSearch) {
      params.set("search", trimmedSearch);
    }

    if (query.status && query.status !== "all") {
      params.set("status", query.status);
    }

    const requestUrl = params.size > 0
      ? `${PLAN_CATALOG_URL}?${params.toString()}`
      : PLAN_CATALOG_URL;

    try {
      const payload = await portalRequest<unknown>(requestUrl, { method: "GET" });
      const plans = extractPlansList(payload);
      if (plans) {
        return plans.map(normalizeSubscriptionPlan);
      }

      throw new PortalApiError(
        "Plans catalog response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        logPortalFallback("fetchPlansCatalog", error);
      }

      return simulate(() => filterPlansCatalog(getSnapshot().plans, query));
    }
  },

  async createSupportTicket(
    input: SupportTicketCreateInput,
  ): Promise<PortalMutationResult<SupportGrant>> {
    const payload: SupportTicketCreateInput = {
      tenantId: input.tenantId.trim(),
      durationHours: normalizePositiveInteger(input.durationHours),
      requestedScope: input.requestedScope.trim(),
      requestedBy: input.requestedBy?.trim() || undefined,
      requestedByEmail: input.requestedByEmail?.trim() || undefined,
    };

    try {
      const resultPayload = await portalRequest<unknown>(SUPPORT_GRANT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const result = extractMutationResult<SupportGrant>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeSupportGrant(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Support ticket create response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("createSupportTicket", error);
      }

      return simulate(() => createMockSupportTicket(payload));
    }
  },

  async createSubscriptionPlan(
    input: SubscriptionPlanInput,
  ): Promise<PortalMutationResult<SubscriptionPlan>> {
    const payload: SubscriptionPlanInput = {
      ...input,
      code: normalizePlanCode(input.code),
      name: input.name.trim(),
      description: input.description.trim(),
      status: normalizePlanStatus(input.status),
      monthlyPriceVnd: Math.round(input.monthlyPriceVnd),
      storageLimitGb: Math.round(input.storageLimitGb),
      adminSeatLimit: Math.round(input.adminSeatLimit),
      employeeSeatLimit: Math.round(input.employeeSeatLimit),
      supportSla: input.supportSla.trim(),
      modules: Array.from(
        new Set(input.modules.map((module) => module.trim()).filter(Boolean)),
      ),
      highlight: input.highlight?.trim() || undefined,
    };

    try {
      const resultPayload = await portalRequest<unknown>(PLAN_CATALOG_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const result = extractMutationResult<SubscriptionPlan>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeSubscriptionPlan(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Create plan response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("createSubscriptionPlan", error);
      }

      return simulate(() => createMockSubscriptionPlan(payload));
    }
  },

  async updateSubscriptionPlan(
    planId: string,
    input: SubscriptionPlanInput,
  ): Promise<PortalMutationResult<SubscriptionPlan>> {
    const payload: SubscriptionPlanInput = {
      ...input,
      code: normalizePlanCode(input.code),
      name: input.name.trim(),
      description: input.description.trim(),
      status: normalizePlanStatus(input.status),
      monthlyPriceVnd: Math.round(input.monthlyPriceVnd),
      storageLimitGb: Math.round(input.storageLimitGb),
      adminSeatLimit: Math.round(input.adminSeatLimit),
      employeeSeatLimit: Math.round(input.employeeSeatLimit),
      supportSla: input.supportSla.trim(),
      modules: Array.from(
        new Set(input.modules.map((module) => module.trim()).filter(Boolean)),
      ),
      highlight: input.highlight?.trim() || undefined,
    };

    try {
      const resultPayload = await portalRequest<unknown>(
        `${PLAN_CATALOG_URL}/${encodeURIComponent(planId)}`,
        {
          method: "PUT",
          body: JSON.stringify(payload),
        },
      );
      const result = extractMutationResult<SubscriptionPlan>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeSubscriptionPlan(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Update plan response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("updateSubscriptionPlan", error);
      }

      return simulate(() => updateMockSubscriptionPlan(planId, payload));
    }
  },

  async deleteSubscriptionPlan(
    planId: string,
  ): Promise<PortalMutationResult<SubscriptionPlan>> {
    try {
      const resultPayload = await portalRequest<unknown>(
        `${PLAN_CATALOG_URL}/${encodeURIComponent(planId)}`,
        { method: "DELETE" },
      );
      const result = extractMutationResult<SubscriptionPlan>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeSubscriptionPlan(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Delete plan response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("deleteSubscriptionPlan", error);
      }

      return simulate(() => deleteMockSubscriptionPlan(planId));
    }
  },

  async markInvoicePaid(
    invoiceId: string,
    input: ManualPaymentInput,
  ): Promise<PortalMutationResult<InvoiceMetadata>> {
    try {
      const resultPayload = await portalRequest<unknown>(
        `${BILLING_URL}/${encodeURIComponent(invoiceId)}/mark-paid`,
        {
          method: "PUT",
          body: JSON.stringify(input),
        },
      );
      const result = extractMutationResult<InvoiceMetadata>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeInvoice(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Mark invoice paid response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("markInvoicePaid", error);
      }

      return simulate(() => markMockInvoicePaid(invoiceId, input));
    }
  },

  async sendInvoiceReminder(
    invoiceId: string,
  ): Promise<PortalMutationResult<InvoiceMetadata>> {
    try {
      const resultPayload = await portalRequest<unknown>(
        `${BILLING_URL}/${encodeURIComponent(invoiceId)}/send-reminder`,
        { method: "POST" },
      );
      const result = extractMutationResult<InvoiceMetadata>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeInvoice(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Send invoice reminder response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("sendInvoiceReminder", error);
      }

      return simulate(() => sendMockInvoiceReminder(invoiceId));
    }
  },

  async updateDraftInvoice(
    invoiceId: string,
    input: DraftInvoiceUpdateInput,
  ): Promise<PortalMutationResult<InvoiceMetadata>> {
    try {
      const resultPayload = await portalRequest<unknown>(
        `${BILLING_URL}/${encodeURIComponent(invoiceId)}`,
        {
          method: "PUT",
          body: JSON.stringify(input),
        },
      );
      const result = extractMutationResult<InvoiceMetadata>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeInvoice(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Update draft invoice response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("updateDraftInvoice", error);
      }

      return simulate(() => updateMockDraftInvoice(invoiceId, input));
    }
  },

  async cancelDraftInvoice(
    invoiceId: string,
  ): Promise<PortalMutationResult<InvoiceMetadata>> {
    try {
      const resultPayload = await portalRequest<unknown>(
        `${BILLING_URL}/${encodeURIComponent(invoiceId)}/cancel`,
        { method: "POST" },
      );
      const result = extractMutationResult<InvoiceMetadata>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeInvoice(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Cancel draft invoice response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("cancelDraftInvoice", error);
      }

      return simulate(() => cancelMockDraftInvoice(invoiceId));
    }
  },

  async downloadInvoicePdf(
    invoiceId: string,
  ): Promise<InvoicePdfDownloadResult> {
    const requestUrl = `${BILLING_URL}/${encodeURIComponent(invoiceId)}/pdf`;

    try {
      const response = await authFetch(requestUrl, { method: "GET" });
      if (!response.ok) {
        if ([404, 405, 501].includes(response.status)) {
          throw new PortalApiError(
            `Control-plane endpoint ${requestUrl} is not available yet.`,
            true,
          );
        }

        throw new PortalApiError(
          `Invoice PDF download failed with status ${response.status}.`,
          false,
        );
      }

      const blob = await response.blob();
      return {
        fileName: `${invoiceId}.pdf`,
        blob,
      };
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          throw error;
        }

        logPortalFallback("downloadInvoicePdf", error);
      }

      const invoice = getSnapshot().invoices.find((item) => item.id === invoiceId);
      if (!invoice) {
        throw new PortalApiError("Không tìm thấy hóa đơn để xuất PDF.", false);
      }

      return simulate(() => ({
        fileName: invoice.pdfFileName,
        blob: createMockInvoicePdfBlob(invoice),
      }));
    }
  },

  async processPaymentGatewayWebhook(
    input: PaymentGatewayWebhookInput,
  ): Promise<PortalMutationResult<InvoiceMetadata>> {
    try {
      const resultPayload = await portalRequest<unknown>(PAYMENT_WEBHOOK_URL, {
        method: "POST",
        body: JSON.stringify(input),
      });
      const result = extractMutationResult<InvoiceMetadata>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeInvoice(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Payment webhook response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("processPaymentGatewayWebhook", error);
      }

      return simulate(() => processMockPaymentGatewayWebhook(input));
    }
  },

  async createWorkspaceOwner(
    input: WorkspaceOwnerCreateInput,
  ): Promise<PortalMutationResult<WorkspaceOwnerProvisioning>> {
    const payload = {
      ...input,
      companyName: input.companyName.trim(),
      workspaceCode: normalizeWorkspaceCode(input.workspaceCode),
      ownerFullName: input.ownerFullName.trim(),
      ownerEmail: normalizeOwnerEmail(input.ownerEmail),
      ownerPhone: input.ownerPhone.trim(),
      note: input.note?.trim() || undefined,
    };

    try {
      const resultPayload = await portalRequest<unknown>(WORKSPACE_OWNER_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const result =
        extractMutationResult<WorkspaceOwnerProvisioning>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeWorkspaceOwner(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Workspace owner create response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("createWorkspaceOwner", error);
      }

      return simulate(() => createMockWorkspaceOwner(payload));
    }
  },

  async resendWorkspaceOwnerInvite(
    ownerId: string,
  ): Promise<PortalMutationResult<WorkspaceOwnerProvisioning>> {
    try {
      const resultPayload = await portalRequest<unknown>(
        `${WORKSPACE_OWNER_URL}/${encodeURIComponent(ownerId)}/resend`,
        { method: "POST" },
      );
      const result =
        extractMutationResult<WorkspaceOwnerProvisioning>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeWorkspaceOwner(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Workspace owner resend response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("resendWorkspaceOwnerInvite", error);
      }

      return simulate(() => resendMockWorkspaceOwnerInvite(ownerId));
    }
  },

  async revokeWorkspaceOwnerInvite(
    ownerId: string,
  ): Promise<PortalMutationResult<WorkspaceOwnerProvisioning>> {
    try {
      const resultPayload = await portalRequest<unknown>(
        `${WORKSPACE_OWNER_URL}/${encodeURIComponent(ownerId)}/revoke`,
        { method: "POST" },
      );
      const result =
        extractMutationResult<WorkspaceOwnerProvisioning>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeWorkspaceOwner(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Workspace owner revoke response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("revokeWorkspaceOwnerInvite", error);
      }

      return simulate(() => revokeMockWorkspaceOwnerInvite(ownerId));
    }
  },

  async activateSupportGrant(
    ticketId: string,
  ): Promise<PortalMutationResult<SupportGrant>> {
    try {
      const resultPayload = await portalRequest<unknown>(
        `${SUPPORT_GRANT_URL}/${encodeURIComponent(ticketId)}/activate`,
        { method: "POST" },
      );
      const result = extractMutationResult<SupportGrant>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeSupportGrant(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Support grant activate response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("activateSupportGrant", error);
      }

      return simulate(() => activateMockSupportSession(ticketId));
    }
  },

  async revokeSupportGrant(
    ticketId: string,
  ): Promise<PortalMutationResult<SupportGrant>> {
    try {
      const resultPayload = await portalRequest<unknown>(
        `${SUPPORT_GRANT_URL}/${encodeURIComponent(ticketId)}/revoke`,
        { method: "PUT" },
      );
      const result = extractMutationResult<SupportGrant>(resultPayload);
      if (result) {
        return {
          ...result,
          snapshot: normalizeSnapshot(result.snapshot),
          record: result.record ? normalizeSupportGrant(result.record) : undefined,
        };
      }

      throw new PortalApiError(
        "Support grant revoke response shape is not supported yet.",
        true,
      );
    } catch (error) {
      if (error instanceof PortalApiError) {
        if (!error.canFallback) {
          return {
            success: false,
            message: error.message,
            snapshot: getSnapshot(),
          };
        }

        logPortalFallback("revokeSupportGrant", error);
      }

      return simulate(() => revokeMockSupportSession(ticketId));
    }
  },

  resetMockStore(): void {
    portalStore = normalizeSnapshot({
      tenants: clone(initialTenants),
      plans: clone(subscriptionPlans),
      invoices: clone(invoiceMetadata),
      supportGrants: clone(initialSupportGrants),
      workspaceOwners: clone(workspaceOwnersSeed),
    });
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

export const planStatusLabel = (status: SubscriptionPlanStatus) => {
  switch (status) {
    case "active":
      return "Hoạt động";
    case "hidden":
      return "Ẩn";
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
