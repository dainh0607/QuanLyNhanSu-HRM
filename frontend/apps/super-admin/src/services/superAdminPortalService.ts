import type {
  BillingStatus,
  InvoiceMetadata,
  OnboardingStatus,
  PaymentTransactionSource,
  SubscriptionStatus,
  SubscriptionPlan,
  SubscriptionPlanStatus,
  SupportGrant,
  SupportAccessStatus,
  TenantSubscription,
} from "../types";
import { API_URL } from "./apiConfig";
import { authFetch } from "./superAdminAuthService";

const CONTROL_PLANE_BASE_URL = `${API_URL}/super-admin/control-plane`;
const CONTROL_PLANE_SNAPSHOT_URL = `${CONTROL_PLANE_BASE_URL}/snapshot`;
const TENANT_DIRECTORY_URL = `${CONTROL_PLANE_BASE_URL}/tenants`;
const PLAN_CATALOG_URL = `${CONTROL_PLANE_BASE_URL}/plans`;
const BILLING_URL = `${CONTROL_PLANE_BASE_URL}/invoices`;
const WORKSPACE_OWNER_URL = `${CONTROL_PLANE_BASE_URL}/workspace-owners`;
const SUPPORT_GRANT_URL = `${CONTROL_PLANE_BASE_URL}/support-grants`;
const DEFAULT_BILLING_PAGE_SIZE = 10;

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
  subscriptionStatus?: SubscriptionStatus | "all";
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

const initialSupportGrants: SupportGrant[] = [];
const initialTenants: TenantSubscription[] = [];
const invoiceMetadata: InvoiceMetadata[] = [];
const subscriptionPlans: SubscriptionPlan[] = [];
const workspaceOwnersSeed: WorkspaceOwnerProvisioning[] = [];

const MOCK_DELAY_MS = 280;
const SUPPORT_SSO_BASE_URL =
  "https://tenant-app.nexahr.local/support-session";

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

export const normalizeWorkspaceCode = (workspaceCode: string): string =>
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

const addHours = (date: Date, hours: number): string =>
  new Date(date.getTime() + hours * 60 * 60 * 1000).toISOString();

const toIsoOrUndefined = (value?: string): string | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
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
    grant.auditActorLabel?.replace(/^Há»‡ thá»‘ng há»— trá»£ - /, "").trim() ||
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
          ? createSupportSessionUrl(
              workspaceCode,
              grant.ticketId.trim().toUpperCase(),
              impersonationToken,
            )
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
      "Quyá»n truy cáº­p há»— trá»£ bá»‹ khĂ³a theo máº·c Ä‘á»‹nh. Má»i thao tĂ¡c xá»­ lĂ½ sá»± cá»‘ táº¡i Tenant Ä‘á»u yĂªu cáº§u Ticket há»— trá»£ Ä‘Ă£ Ä‘Æ°á»£c khĂ¡ch hĂ ng phĂª duyá»‡t.",
    impersonationToken,
    sessionLaunchUrl,
    auditActorLabel:
      grant.auditActorLabel?.trim() || `Há»‡ thá»‘ng há»— trá»£ - ${requestedBy}`,
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

      const nextSubscriptionStatus: SubscriptionStatus = graceExpired
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

let portalStore: ControlPlaneSnapshot = normalizeSnapshot({
  tenants: clone(initialTenants),
  plans: clone(subscriptionPlans),
  invoices: clone(invoiceMetadata),
  supportGrants: clone(initialSupportGrants),
  workspaceOwners: clone(workspaceOwnersSeed),
});

const getSnapshot = (): ControlPlaneSnapshot => normalizeSnapshot(clone(portalStore));

const logPortalFallback = (context: string, error: PortalApiError) => {
  console.warn(`[super-admin] ${context} is using mock fallback: ${error.message}`);
};

const usePortalFallback = (context: string, error: unknown) => {
  if (!(error instanceof PortalApiError)) {
    throw error;
  }

  if (!error.canFallback) {
    throw error;
  }

  logPortalFallback(context, error);
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
      usePortalFallback("control-plane snapshot", error);
      return simulate(() => normalizeSnapshot(getSnapshot()));
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
      usePortalFallback("tenant directory", error);
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
      usePortalFallback("billing catalog", error);
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
      usePortalFallback("support tickets", error);
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
      usePortalFallback("plans catalog", error);
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
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
      throw error;
    }
  },
  // Xóa resetMockStore
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

export const subscriptionLabel = (status: SubscriptionStatus) => {
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
