export type PortalTab = "tenants" | "plans" | "billing" | "support";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "suspended";
export type BillingStatus = "paid" | "upcoming" | "overdue" | "draft";
export type SupportAccessStatus =
  | "not_requested"
  | "pending_customer_approval"
  | "granted"
  | "expired"
  | "revoked";
export type OnboardingStatus =
  | "awaiting_contract"
  | "setup_in_progress"
  | "ready"
  | "trial";

export interface SubscriptionPlan {
  id: string;
  code: string;
  name: string;
  description: string;
  monthlyPriceVnd: number;
  storageLimitGb: number;
  adminSeatLimit: number;
  employeeSeatLimit: number;
  supportSla: string;
  modules: string[];
  highlight?: string;
}

export interface TenantSubscription {
  id: string;
  companyName: string;
  workspaceCode: string;
  subscriptionCode: string;
  planCode: string;
  planName: string;
  subscriptionStatus: SubscriptionStatus;
  onboardingStatus: OnboardingStatus;
  billingCycle: "monthly" | "quarterly" | "yearly";
  nextRenewalAt: string;
  portalAdminEmail: string;
  storageLimitGb: number;
  storageUsedGb: number;
  adminSeats: number;
  activeEmployees: number;
  lastInvoiceCode: string;
  billingStatus: BillingStatus;
  workspaceIsolationMode: "ticket-only-support";
  supportTicketId?: string;
  supportAccessStatus: SupportAccessStatus;
  supportAccessExpiresAt?: string;
}

export interface InvoiceMetadata {
  id: string;
  invoiceCode: string;
  companyName: string;
  workspaceCode: string;
  billingPeriodLabel: string;
  issuedAt: string;
  dueAt: string;
  amountVnd: number;
  status: BillingStatus;
  paymentGatewayRef: string;
  summaryNote: string;
  metadataScope: "service-metadata-only";
}

export interface SupportGrant {
  ticketId: string;
  companyName: string;
  workspaceCode: string;
  requestedScope: string;
  customerApprovedAt?: string;
  approvedByCustomerContact?: string;
  status: SupportAccessStatus;
  expiresAt?: string;
  note: string;
}
