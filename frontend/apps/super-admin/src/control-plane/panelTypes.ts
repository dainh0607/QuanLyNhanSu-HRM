import type { SubscriptionPlanStatus } from "../types";

export interface SubscriptionPlanFormState {
  id?: string;
  code: string;
  name: string;
  description: string;
  status: SubscriptionPlanStatus;
  monthlyPriceVnd: string;
  storageLimitGb: string;
  adminSeatLimit: string;
  employeeSeatLimit: string;
  supportSla: string;
  modules: string[];
}

export interface SubscriptionPlanFormErrors {
  code?: string;
  name?: string;
  description?: string;
  monthlyPriceVnd?: string;
  storageLimitGb?: string;
  adminSeatLimit?: string;
  employeeSeatLimit?: string;
  supportSla?: string;
  modules?: string;
}

export interface ManualPaymentFormState {
  paymentGatewayRef: string;
  receivedAt: string;
}

export interface ManualPaymentFormErrors {
  paymentGatewayRef?: string;
  receivedAt?: string;
}

export interface DraftInvoiceFormState {
  discountVnd: string;
  additionalSeatFeeVnd: string;
  summaryNote: string;
  dueAt: string;
}

export interface DraftInvoiceFormErrors {
  discountVnd?: string;
  additionalSeatFeeVnd?: string;
  summaryNote?: string;
  dueAt?: string;
}

export interface SupportTicketFormState {
  tenantId: string;
  durationHours: string;
  requestedScope: string;
}

export interface SupportTicketFormErrors {
  tenantId?: string;
  durationHours?: string;
  requestedScope?: string;
}
