import {
  startTransition,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { WorkspaceOwnersPanel } from "./control-plane/WorkspaceOwnersPanel";
import { TenantsPanel } from "./control-plane/TenantsPanel";
import { clearFieldError } from "./control-plane/formErrorUtils";
import {
  BillingPanel,
  type DraftInvoiceFormErrors,
  type DraftInvoiceFormState,
  type ManualPaymentFormErrors,
  type ManualPaymentFormState,
  PlansPanel,
  SupportPanel,
  type SupportTicketFormErrors,
  type SupportTicketFormState,
  type SubscriptionPlanFormErrors,
  type SubscriptionPlanFormState,
} from "./control-plane/CatalogPanels";
import "./PortalControlPlane.css";
import type {
  BillingStatus,
  InvoiceMetadata,
  SubscriptionPlan,
  SubscriptionPlanStatus,
  SupportAccessStatus,
  SupportGrant,
  TenantSubscription,
} from "./types";
import {
  type BillingListQuery,
  type BillingListPage,
  type ControlPlaneSnapshot,
  type DraftInvoiceUpdateInput,
  type ManualPaymentInput,
  planStatusLabel,
  type PlanCatalogQuery,
  resolveWorkspaceOwnerStatus,
  type SupportTicketCreateInput,
  type SupportTicketQuery,
  type SubscriptionPlanInput,
  superAdminPortalService,
  type PortalMutationResult,
  type TenantDirectoryQuery,
  type WorkspaceOwnerCreateInput,
  type WorkspaceOwnerProvisioning,
  type WorkspaceOwnerProvisioningStatus,
} from "./services/superAdminPortalService";

interface PortalUser {
  fullName?: string;
  email?: string;
}

interface PortalControlPlaneProps {
  user?: PortalUser | null;
  onLogout?: () => void;
}

type TabId = "owners" | "tenants" | "plans" | "billing" | "support";
type ToastKind = "success" | "error" | "info";

interface ToastMessage {
  id: string;
  kind: ToastKind;
  message: string;
}

const tabs: Array<{ id: TabId; label: string; icon: string }> = [
  { id: "owners", label: "Chủ sở hữu", icon: "person_add" },
  { id: "tenants", label: "Danh bạ Tenant", icon: "apartment" },
  { id: "plans", label: "Gói dịch vụ", icon: "inventory_2" },
  { id: "billing", label: "Dữ liệu thanh toán", icon: "receipt_long" },
  { id: "support", label: "Quyền hỗ trợ", icon: "support_agent" },
];

const INITIAL_OWNER_FORM: WorkspaceOwnerCreateInput = {
  companyName: "",
  workspaceCode: "",
  ownerFullName: "",
  ownerEmail: "",
  ownerPhone: "",
  planCode: "STARTER",
  billingCycle: "monthly",
  note: "",
};

const INITIAL_PLAN_FORM: SubscriptionPlanFormState = {
  code: "",
  name: "",
  description: "",
  status: "active",
  monthlyPriceVnd: "",
  storageLimitGb: "",
  adminSeatLimit: "",
  employeeSeatLimit: "",
  supportSla: "",
  modules: [],
};

const INITIAL_MANUAL_PAYMENT_FORM: ManualPaymentFormState = {
  paymentGatewayRef: "",
  receivedAt: "",
};

const INITIAL_DRAFT_INVOICE_FORM: DraftInvoiceFormState = {
  discountVnd: "0",
  additionalSeatFeeVnd: "0",
  summaryNote: "",
  dueAt: "",
};

const INITIAL_SUPPORT_TICKET_FORM: SupportTicketFormState = {
  tenantId: "",
  durationHours: "1",
  requestedScope: "",
};

const SECURITY_BOUNDARY_MESSAGE =
  "SuperAdmin chỉ quản lý metadata mức Control Plane. Dữ liệu nghiệp vụ của Tenant luôn được khóa trừ khi có phiên hỗ trợ đã được khách hàng phê duyệt.";
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WORKSPACE_CODE_PATTERN = /^[A-Z0-9-]+$/;
const PLAN_CODE_PATTERN = /^[A-Z0-9-]+$/;
const BILLING_CYCLE_LABELS: Record<TenantSubscription["billingCycle"], string> = {
  monthly: "hàng tháng",
  quarterly: "hàng quý",
  yearly: "hàng năm",
};
const BILLING_CYCLE_MULTIPLIER: Record<TenantSubscription["billingCycle"], number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};
const PLAN_FEATURE_OPTIONS = [
  "Nhân sự",
  "Hồ sơ",
  "Chấm công",
  "Hợp đồng",
  "Hợp đồng điện tử",
  "Phân quyền",
  "Tài liệu",
  "Audit Log",
  "Audit nâng cao",
  "SSO",
  "Support Ticket",
];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatNumber = (value: number) => numberFormatter.format(value);
const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString("vi-VN") : "Chưa có";
const normalizePlanCode = (value: string) => value.trim().toUpperCase().replace(/\s+/g, "-");
const toDateTimeLocalValue = (value?: string) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().slice(0, 16);
};

const getInitials = (fullName: string | undefined) => {
  if (!fullName) return "SA";
  const names = fullName.trim().split(/\s+/).filter(Boolean);
  if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  return names[0]?.slice(0, 2).toUpperCase() ?? "SA";
};

const getToneClass = (value: string) => {
  if (["activated", "active", "paid", "granted", "ready"].includes(value)) return "is-emerald";
  if (["invited", "trial", "upcoming", "pending_customer_approval"].includes(value)) return "is-sky";
  if (["expired", "revoked", "overdue", "past_due", "suspended"].includes(value)) return "is-rose";
  return "is-slate";
};

const getUsagePercent = (tenant: TenantSubscription) =>
  tenant.storageLimitGb > 0
    ? Math.min(100, Math.round((tenant.storageUsedGb / tenant.storageLimitGb) * 100))
    : 0;

const createToastId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export default function PortalControlPlane({
  user,
  onLogout,
}: PortalControlPlaneProps) {
  const [activeTab, setActiveTab] = useState<TabId>("owners");
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerStatusFilter, setOwnerStatusFilter] = useState<
    WorkspaceOwnerProvisioningStatus | "all"
  >("all");
  const [tenantStatusFilter, setTenantStatusFilter] = useState<
    TenantSubscription["subscriptionStatus"] | "all"
  >("all");
  const [planStatusFilter, setPlanStatusFilter] = useState<
    SubscriptionPlanStatus | "all"
  >("all");
  const [billingFilter, setBillingFilter] = useState<BillingStatus | "all">("all");
  const [supportFilter, setSupportFilter] = useState<SupportAccessStatus | "all">("all");
  const [ownerForm, setOwnerForm] = useState<WorkspaceOwnerCreateInput>(INITIAL_OWNER_FORM);
  const [selectedWorkspaceCode, setSelectedWorkspaceCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [snapshot, setSnapshot] = useState<ControlPlaneSnapshot | null>(null);
  const [tenantDirectory, setTenantDirectory] = useState<TenantSubscription[]>([]);
  const [tenantDirectoryLoading, setTenantDirectoryLoading] = useState(false);
  const [planCatalog, setPlanCatalog] = useState<SubscriptionPlan[]>([]);
  const [planCatalogLoading, setPlanCatalogLoading] = useState(false);
  const [planForm, setPlanForm] = useState<SubscriptionPlanFormState>(INITIAL_PLAN_FORM);
  const [planFormErrors, setPlanFormErrors] = useState<SubscriptionPlanFormErrors>({});
  const [planEditorOpen, setPlanEditorOpen] = useState(false);
  const [planEditorMode, setPlanEditorMode] = useState<"create" | "edit">("create");
  const [planMenuId, setPlanMenuId] = useState<string | null>(null);
  const [pendingPlanDelete, setPendingPlanDelete] = useState<SubscriptionPlan | null>(null);
  const [savingPlan, setSavingPlan] = useState(false);
  const [deletingPlanId, setDeletingPlanId] = useState<string | null>(null);
  const [billingPage, setBillingPage] = useState<BillingListPage>({
    items: [],
    total: 0,
    page: 1,
    pageSize: 4,
    totalPages: 1,
  });
  const [billingLoading, setBillingLoading] = useState(false);
  const [billingPageIndex, setBillingPageIndex] = useState(1);
  const [supportDirectory, setSupportDirectory] = useState<SupportGrant[]>([]);
  const [supportLoading, setSupportLoading] = useState(false);
  const [supportRequestOpen, setSupportRequestOpen] = useState(false);
  const [supportRequestForm, setSupportRequestForm] = useState<SupportTicketFormState>(
    INITIAL_SUPPORT_TICKET_FORM,
  );
  const [supportRequestErrors, setSupportRequestErrors] = useState<SupportTicketFormErrors>(
    {},
  );
  const [creatingSupportTicket, setCreatingSupportTicket] = useState(false);
  const [activatingSupportTicketId, setActivatingSupportTicketId] = useState<string | null>(null);
  const [revokingSupportTicketId, setRevokingSupportTicketId] = useState<string | null>(null);
  const [invoiceMenuId, setInvoiceMenuId] = useState<string | null>(null);
  const [paymentDialogInvoice, setPaymentDialogInvoice] = useState<InvoiceMetadata | null>(null);
  const [manualPaymentForm, setManualPaymentForm] = useState<ManualPaymentFormState>(
    INITIAL_MANUAL_PAYMENT_FORM,
  );
  const [manualPaymentErrors, setManualPaymentErrors] = useState<ManualPaymentFormErrors>({});
  const [draftEditorInvoice, setDraftEditorInvoice] = useState<InvoiceMetadata | null>(null);
  const [draftInvoiceForm, setDraftInvoiceForm] = useState<DraftInvoiceFormState>(
    INITIAL_DRAFT_INVOICE_FORM,
  );
  const [draftInvoiceErrors, setDraftInvoiceErrors] = useState<DraftInvoiceFormErrors>({});
  const [markingInvoiceId, setMarkingInvoiceId] = useState<string | null>(null);
  const [remindingInvoiceId, setRemindingInvoiceId] = useState<string | null>(null);
  const [downloadingInvoiceId, setDownloadingInvoiceId] = useState<string | null>(null);
  const [editingDraftInvoiceId, setEditingDraftInvoiceId] = useState<string | null>(null);
  const [cancelingDraftInvoiceId, setCancelingDraftInvoiceId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [pendingOwnerAction, setPendingOwnerAction] = useState<{
    ownerId: string;
    kind: "resend" | "revoke";
  } | null>(null);
  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase());

  useEffect(() => {
    let isMounted = true;

    const loadSnapshot = async () => {
      setLoading(true);
      const nextSnapshot = await superAdminPortalService.fetchControlPlaneSnapshot();
      if (!isMounted) {
        return;
      }

      startTransition(() => {
        setSnapshot(nextSnapshot);
        setTenantDirectory(nextSnapshot.tenants);
        setPlanCatalog(nextSnapshot.plans);
        setSupportDirectory(nextSnapshot.supportGrants);
        setSelectedWorkspaceCode((current) => current || nextSnapshot.tenants[0]?.workspaceCode || "");
      });
      setLoading(false);
    };

    void loadSnapshot();

    return () => {
      isMounted = false;
    };
  }, []);

  const plans = snapshot?.plans ?? [];
  const tenants = snapshot?.tenants ?? [];
  const supportGrants = snapshot?.supportGrants ?? [];
  const workspaceOwners = snapshot?.workspaceOwners ?? [];

  const syncSnapshot = (nextSnapshot: ControlPlaneSnapshot) => {
    startTransition(() => {
      setSnapshot(nextSnapshot);
      setTenantDirectory(nextSnapshot.tenants);
      setPlanCatalog(nextSnapshot.plans);
      setSupportDirectory(nextSnapshot.supportGrants);
      setSelectedWorkspaceCode((current) => current || nextSnapshot.tenants[0]?.workspaceCode || "");
    });
  };

  const pushToast = (message: string, kind: ToastKind = "info") => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return;
    }

    const toastId = createToastId();
    setToasts((current) => [...current, { id: toastId, kind, message: trimmedMessage }]);

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== toastId));
    }, 4200);
  };

  const dismissToast = (toastId: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== toastId));
  };

  const filteredOwners = useMemo(
    () =>
      workspaceOwners.filter((owner) => {
        const resolvedStatus = resolveWorkspaceOwnerStatus(owner);
        const matchesSearch =
          deferredSearch.length === 0 ||
          owner.companyName.toLowerCase().includes(deferredSearch) ||
          owner.workspaceCode.toLowerCase().includes(deferredSearch) ||
          owner.ownerEmail.toLowerCase().includes(deferredSearch) ||
          owner.ownerFullName.toLowerCase().includes(deferredSearch);

        return matchesSearch && (ownerStatusFilter === "all" || resolvedStatus === ownerStatusFilter);
      }),
    [deferredSearch, ownerStatusFilter, workspaceOwners],
  );

  useEffect(() => {
    if (!snapshot) {
      return;
    }

    let isMounted = true;
    const query: TenantDirectoryQuery = {
      search: deferredSearch,
      subscriptionStatus: tenantStatusFilter,
    };

    const loadTenantDirectory = async () => {
      setTenantDirectoryLoading(true);
      const nextDirectory = await superAdminPortalService.fetchTenantDirectory(query);
      if (!isMounted) {
        return;
      }

      startTransition(() => {
        setTenantDirectory(nextDirectory);
        setSelectedWorkspaceCode((current) => {
          if (nextDirectory.some((tenant) => tenant.workspaceCode === current)) {
            return current;
          }

          return nextDirectory[0]?.workspaceCode || "";
        });
      });
      setTenantDirectoryLoading(false);
    };

    void loadTenantDirectory();

    return () => {
      isMounted = false;
    };
  }, [deferredSearch, snapshot, tenantStatusFilter]);

  useEffect(() => {
    if (!snapshot || activeTab !== "plans") {
      return;
    }

    let isMounted = true;
    const query: PlanCatalogQuery = {
      search: deferredSearch,
      status: planStatusFilter,
    };

    const loadPlanCatalog = async () => {
      setPlanCatalogLoading(true);
      const nextPlans = await superAdminPortalService.fetchPlansCatalog(query);
      if (!isMounted) {
        return;
      }

      startTransition(() => {
        setPlanCatalog(nextPlans);
      });
      setPlanCatalogLoading(false);
    };

    void loadPlanCatalog();

    return () => {
      isMounted = false;
    };
  }, [activeTab, deferredSearch, planStatusFilter, snapshot]);

  useEffect(() => {
    setBillingPageIndex(1);
  }, [billingFilter, deferredSearch]);

  useEffect(() => {
    if (!snapshot || activeTab !== "billing") {
      return;
    }

    let isMounted = true;
    const query: BillingListQuery = {
      search: deferredSearch,
      status: billingFilter,
      page: billingPageIndex,
      pageSize: billingPage.pageSize,
    };

    const loadBillingCatalog = async () => {
      setBillingLoading(true);
      const nextPage = await superAdminPortalService.fetchBillingCatalog(query);
      if (!isMounted) {
        return;
      }

      startTransition(() => {
        setBillingPage(nextPage);
        setBillingPageIndex((current) => (current === nextPage.page ? current : nextPage.page));
      });
      setBillingLoading(false);
    };

    void loadBillingCatalog();

    return () => {
      isMounted = false;
    };
  }, [activeTab, billingFilter, billingPage.pageSize, billingPageIndex, deferredSearch, snapshot]);

  useEffect(() => {
    if (!snapshot || activeTab !== "support") {
      return;
    }

    let isMounted = true;
    const query: SupportTicketQuery = {
      search: deferredSearch,
      status: supportFilter,
    };

    const loadSupportTickets = async () => {
      setSupportLoading(true);
      const nextSupportTickets = await superAdminPortalService.fetchSupportTickets(query);
      if (!isMounted) {
        return;
      }

      startTransition(() => {
        setSupportDirectory(nextSupportTickets);
      });
      setSupportLoading(false);
    };

    void loadSupportTickets();

    return () => {
      isMounted = false;
    };
  }, [activeTab, deferredSearch, snapshot, supportFilter]);

  const selectedTenant =
    tenantDirectory.find((tenant) => tenant.workspaceCode === selectedWorkspaceCode) ??
    tenantDirectory[0] ??
    null;

  const monthlyRecurringRevenue = useMemo(
    () =>
      tenants.reduce((total, tenant) => {
        const plan = plans.find((item) => item.code === tenant.planCode);
        return total + (plan?.monthlyPriceVnd ?? 0);
      }, 0),
    [plans, tenants],
  );

  const onboardingPlans = useMemo(
    () => plans.filter((plan) => plan.status === "active"),
    [plans],
  );

  const ownerFormPlan = useMemo(
    () => onboardingPlans.find((plan) => plan.code === ownerForm.planCode) ?? null,
    [onboardingPlans, ownerForm.planCode],
  );

  const projectedMonthlyRevenue = ownerFormPlan?.monthlyPriceVnd ?? 0;
  const projectedCycleAmount =
    projectedMonthlyRevenue * BILLING_CYCLE_MULTIPLIER[ownerForm.billingCycle];

  const normalizedWorkspaceCode = ownerForm.workspaceCode.trim().toUpperCase();
  const normalizedOwnerEmail = ownerForm.ownerEmail.trim().toLowerCase();
  const workspaceCodeFormatError =
    normalizedWorkspaceCode.length > 0 && !WORKSPACE_CODE_PATTERN.test(normalizedWorkspaceCode)
      ? "Mã Workspace chỉ được chứa chữ in hoa, số hoặc dấu gạch ngang."
      : null;
  const workspaceCodeConflict =
    normalizedWorkspaceCode.length > 0 &&
    (workspaceOwners.some((owner) => owner.workspaceCode === normalizedWorkspaceCode) ||
      tenants.some((tenant) => tenant.workspaceCode === normalizedWorkspaceCode));
  const ownerEmailError =
    normalizedOwnerEmail.length > 0 && !EMAIL_PATTERN.test(normalizedOwnerEmail)
      ? "Email chủ sở hữu chưa đúng định dạng."
      : null;

  const workspaceCodeMessage =
    normalizedWorkspaceCode.length === 0
      ? "Ví dụ: ABCCO. Hệ thống sẽ kiểm tra trùng lặp ngay khi bạn nhập."
      : workspaceCodeFormatError
        ? workspaceCodeFormatError
        : workspaceCodeConflict
          ? `Mã Workspace ${normalizedWorkspaceCode} đã tồn tại hoặc đang nằm trong hàng chờ kích hoạt.`
          : `Mã Workspace ${normalizedWorkspaceCode} hiện đang khả dụng.`;
  const workspaceCodeMessageTone =
    normalizedWorkspaceCode.length === 0
      ? "info"
      : workspaceCodeFormatError || workspaceCodeConflict
        ? "error"
        : "success";

  const canSubmitOwnerForm =
    ownerForm.companyName.trim().length > 0 &&
    normalizedWorkspaceCode.length > 0 &&
    ownerForm.ownerFullName.trim().length > 0 &&
    normalizedOwnerEmail.length > 0 &&
    ownerFormPlan !== null &&
    !workspaceCodeFormatError &&
    !workspaceCodeConflict &&
    !ownerEmailError;

  const tenantUsageCount = (plan: SubscriptionPlan) =>
    tenants.filter((tenant) => tenant.planCode === plan.code).length;

  const resetPlanForm = () => {
    setPlanForm(INITIAL_PLAN_FORM);
    setPlanFormErrors({});
    setPlanEditorMode("create");
    setPlanEditorOpen(false);
  };

  const openCreatePlanEditor = () => {
    setPlanMenuId(null);
    setPlanForm(INITIAL_PLAN_FORM);
    setPlanFormErrors({});
    setPlanEditorMode("create");
    setPlanEditorOpen(true);
  };

  const openEditPlanEditor = (plan: SubscriptionPlan) => {
    setPlanMenuId(null);
    setPlanForm({
      id: plan.id,
      code: plan.code,
      name: plan.name,
      description: plan.description,
      status: plan.status,
      monthlyPriceVnd: String(plan.monthlyPriceVnd),
      storageLimitGb: String(plan.storageLimitGb),
      adminSeatLimit: String(plan.adminSeatLimit),
      employeeSeatLimit: String(plan.employeeSeatLimit),
      supportSla: plan.supportSla,
      modules: [...plan.modules],
    });
    setPlanFormErrors({});
    setPlanEditorMode("edit");
    setPlanEditorOpen(true);
  };

  const validatePlanForm = (
    form: SubscriptionPlanFormState,
  ): SubscriptionPlanFormErrors => {
    const errors: SubscriptionPlanFormErrors = {};
    const normalizedCode = normalizePlanCode(form.code);
    const monthlyPrice = Number(form.monthlyPriceVnd);
    const storageLimit = Number(form.storageLimitGb);
    const adminLimit = Number(form.adminSeatLimit);
    const employeeLimit = Number(form.employeeSeatLimit);
    const duplicateCode = plans.find(
      (plan) => plan.code === normalizedCode && plan.id !== form.id,
    );

    if (!normalizedCode) {
      errors.code = "Vui lòng nhập mã gói.";
    } else if (!PLAN_CODE_PATTERN.test(normalizedCode)) {
      errors.code = "Mã gói chỉ được chứa chữ in hoa, số hoặc dấu gạch ngang.";
    } else if (duplicateCode) {
      errors.code = `Mã gói ${normalizedCode} đã tồn tại.`;
    }

    if (!form.name.trim()) {
      errors.name = "Vui lòng nhập tên gói.";
    }

    if (!form.description.trim()) {
      errors.description = "Vui lòng nhập mô tả ngắn.";
    }

    if (form.monthlyPriceVnd.trim().length === 0) {
      errors.monthlyPriceVnd = "Vui lòng nhập mức giá.";
    } else if (!Number.isFinite(monthlyPrice) || monthlyPrice < 0) {
      errors.monthlyPriceVnd = "Mức giá phải là số hợp lệ và không được âm.";
    }

    if (form.storageLimitGb.trim().length === 0) {
      errors.storageLimitGb = "Vui lòng nhập dung lượng lưu trữ.";
    } else if (!Number.isFinite(storageLimit) || storageLimit < 0) {
      errors.storageLimitGb = "Dung lượng lưu trữ không được âm.";
    }

    if (form.adminSeatLimit.trim().length === 0) {
      errors.adminSeatLimit = "Vui lòng nhập số quản trị viên tối đa.";
    } else if (!Number.isFinite(adminLimit) || adminLimit < 0) {
      errors.adminSeatLimit = "Số quản trị viên tối đa không được âm.";
    }

    if (form.employeeSeatLimit.trim().length === 0) {
      errors.employeeSeatLimit = "Vui lòng nhập số nhân viên tối đa.";
    } else if (!Number.isFinite(employeeLimit) || employeeLimit < 0) {
      errors.employeeSeatLimit = "Số nhân viên tối đa không được âm.";
    }

    if (!form.supportSla.trim()) {
      errors.supportSla = "Vui lòng nhập cam kết SLA.";
    }

    if (form.modules.length === 0) {
      errors.modules = "Vui lòng chọn ít nhất một tính năng.";
    }

    return errors;
  };

  const validateManualPaymentForm = (
    form: ManualPaymentFormState,
  ): ManualPaymentFormErrors => {
    const errors: ManualPaymentFormErrors = {};

    if (!form.paymentGatewayRef.trim()) {
      errors.paymentGatewayRef = "Vui lòng nhập mã giao dịch.";
    }

    if (!form.receivedAt.trim()) {
      errors.receivedAt = "Vui lòng chọn ngày nhận tiền.";
    } else if (Number.isNaN(Date.parse(form.receivedAt))) {
      errors.receivedAt = "Ngày nhận tiền chưa hợp lệ.";
    }

    return errors;
  };

  const validateDraftInvoiceForm = (
    form: DraftInvoiceFormState,
  ): DraftInvoiceFormErrors => {
    const errors: DraftInvoiceFormErrors = {};
    const discount = Number(form.discountVnd);
    const additionalFee = Number(form.additionalSeatFeeVnd);

    if (!form.discountVnd.trim()) {
      errors.discountVnd = "Vui lòng nhập giảm giá, có thể là 0.";
    } else if (!Number.isFinite(discount) || discount < 0) {
      errors.discountVnd = "Giảm giá phải là số hợp lệ và không được âm.";
    }

    if (!form.additionalSeatFeeVnd.trim()) {
      errors.additionalSeatFeeVnd = "Vui lòng nhập phí user phát sinh, có thể là 0.";
    } else if (!Number.isFinite(additionalFee) || additionalFee < 0) {
      errors.additionalSeatFeeVnd = "Phí user phát sinh phải là số hợp lệ và không được âm.";
    }

    if (!form.summaryNote.trim()) {
      errors.summaryNote = "Vui lòng nhập ghi chú chi tiết gói cước.";
    }

    if (!form.dueAt.trim()) {
      errors.dueAt = "Vui lòng chọn hạn thanh toán.";
    } else if (Number.isNaN(Date.parse(form.dueAt))) {
      errors.dueAt = "Hạn thanh toán chưa hợp lệ.";
    }

    return errors;
  };

  const closePaymentDialog = () => {
    setPaymentDialogInvoice(null);
    setManualPaymentForm(INITIAL_MANUAL_PAYMENT_FORM);
    setManualPaymentErrors({});
  };

  const openPaymentDialog = (invoice: InvoiceMetadata) => {
    setInvoiceMenuId(null);
    setPaymentDialogInvoice(invoice);
    setManualPaymentForm({
      paymentGatewayRef: invoice.paymentGatewayRef ?? "",
      receivedAt: toDateTimeLocalValue(new Date().toISOString()),
    });
    setManualPaymentErrors({});
  };

  const closeDraftEditor = () => {
    setDraftEditorInvoice(null);
    setDraftInvoiceForm(INITIAL_DRAFT_INVOICE_FORM);
    setDraftInvoiceErrors({});
  };

  const openDraftEditor = (invoice: InvoiceMetadata) => {
    setInvoiceMenuId(null);
    setDraftEditorInvoice(invoice);
    setDraftInvoiceForm({
      discountVnd: String(invoice.discountVnd),
      additionalSeatFeeVnd: String(invoice.additionalSeatFeeVnd),
      summaryNote: invoice.summaryNote,
      dueAt: toDateTimeLocalValue(invoice.dueAt),
    });
    setDraftInvoiceErrors({});
  };

  const searchPlaceholder = (() => {
    switch (activeTab) {
      case "plans":
        return "Tìm kiếm gói, tính năng, SLA...";
      case "tenants":
        return "Tìm kiếm Tenant, Workspace, Email, Hóa đơn...";
      case "billing":
        return "Tìm theo mã hóa đơn hoặc mã Workspace...";
      case "support":
        return "Tìm theo mã Ticket hoặc mã Workspace...";
      default:
        return "Tìm kiếm chủ sở hữu, Tenant, Workspace...";
    }
  })();

  const planFeatureOptions = useMemo(
    () =>
      Array.from(
        new Set([
          ...PLAN_FEATURE_OPTIONS,
          ...plans.flatMap((plan) => plan.modules),
          ...planForm.modules,
        ]),
      ),
    [planForm.modules, plans],
  );

  useEffect(() => {
    if (onboardingPlans.length === 0) {
      setOwnerForm((current) => (current.planCode === "" ? current : { ...current, planCode: "" }));
      return;
    }

    setOwnerForm((current) =>
      onboardingPlans.some((plan) => plan.code === current.planCode)
        ? current
        : {
            ...current,
            planCode: onboardingPlans[0].code,
          },
    );
  }, [onboardingPlans]);

  const updateFromMutation = <T,>(
    result: PortalMutationResult<T>,
    toastKindOnSuccess: ToastKind = "success",
  ) => {
    syncSnapshot(result.snapshot);
    pushToast(result.message, result.success ? toastKindOnSuccess : "error");
  };

  const handleFormChange = <K extends keyof WorkspaceOwnerCreateInput>(
    field: K,
    value: WorkspaceOwnerCreateInput[K],
  ) => setOwnerForm((current) => ({ ...current, [field]: value }));

  const handlePlanFormChange = <K extends keyof SubscriptionPlanFormState>(
    field: K,
    value: SubscriptionPlanFormState[K],
  ) => {
    setPlanForm((current) => ({ ...current, [field]: value }));
    setPlanFormErrors((current) =>
      clearFieldError(current, field as keyof SubscriptionPlanFormErrors),
    );
  };

  const handlePlanFeatureToggle = (feature: string) => {
    setPlanForm((current) => {
      const nextModules = current.modules.includes(feature)
        ? current.modules.filter((item) => item !== feature)
        : [...current.modules, feature];

      return {
        ...current,
        modules: nextModules,
      };
    });
    setPlanFormErrors((current) => {
      if (!current.modules) {
        return current;
      }

      const nextErrors = { ...current };
      delete nextErrors.modules;
      return nextErrors;
    });
  };

  const handlePlanSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const nextErrors = validatePlanForm(planForm);
    setPlanFormErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      pushToast("Biểu mẫu gói dịch vụ còn thiếu hoặc chưa hợp lệ. Vui lòng kiểm tra lại.", "error");
      return;
    }

    const payload: SubscriptionPlanInput = {
      code: normalizePlanCode(planForm.code),
      name: planForm.name.trim(),
      description: planForm.description.trim(),
      status: planForm.status,
      monthlyPriceVnd: Number(planForm.monthlyPriceVnd),
      storageLimitGb: Number(planForm.storageLimitGb),
      adminSeatLimit: Number(planForm.adminSeatLimit),
      employeeSeatLimit: Number(planForm.employeeSeatLimit),
      supportSla: planForm.supportSla.trim(),
      modules: planForm.modules,
    };

    if (planEditorMode === "edit" && !planForm.id) {
      pushToast("Không tìm thấy định danh gói dịch vụ để cập nhật.", "error");
      return;
    }

    const planId = planForm.id;

    setSavingPlan(true);
    try {
      const result =
        planEditorMode === "create"
          ? await superAdminPortalService.createSubscriptionPlan(payload)
          : await superAdminPortalService.updateSubscriptionPlan(planId as string, payload);

      updateFromMutation(result);

      if (result.success) {
        resetPlanForm();
      }
    } finally {
      setSavingPlan(false);
    }
  };

  const handlePlanDeleteConfirm = async () => {
    if (!pendingPlanDelete) {
      return;
    }

    setDeletingPlanId(pendingPlanDelete.id);
    try {
      const result = await superAdminPortalService.deleteSubscriptionPlan(pendingPlanDelete.id);
      updateFromMutation(result);

      if (result.success) {
        setPendingPlanDelete(null);
      }
    } finally {
      setDeletingPlanId(null);
    }
  };

  const handleManualPaymentChange = <K extends keyof ManualPaymentFormState>(
    field: K,
    value: ManualPaymentFormState[K],
  ) => {
    setManualPaymentForm((current) => ({ ...current, [field]: value }));
    setManualPaymentErrors((current) => clearFieldError(current, field));
  };

  const handleDraftInvoiceChange = <K extends keyof DraftInvoiceFormState>(
    field: K,
    value: DraftInvoiceFormState[K],
  ) => {
    setDraftInvoiceForm((current) => ({ ...current, [field]: value }));
    setDraftInvoiceErrors((current) => clearFieldError(current, field));
  };

  const handleSubmitManualPayment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!paymentDialogInvoice) {
      return;
    }

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const nextErrors = validateManualPaymentForm(manualPaymentForm);
    setManualPaymentErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      pushToast("Popup xác nhận thanh toán còn thiếu dữ liệu.", "error");
      return;
    }

    const payload: ManualPaymentInput = {
      paymentGatewayRef: manualPaymentForm.paymentGatewayRef.trim(),
      receivedAt: new Date(manualPaymentForm.receivedAt).toISOString(),
    };

    setMarkingInvoiceId(paymentDialogInvoice.id);
    try {
      const result = await superAdminPortalService.markInvoicePaid(
        paymentDialogInvoice.id,
        payload,
      );
      updateFromMutation(result);

      if (result.success) {
        closePaymentDialog();
      }
    } finally {
      setMarkingInvoiceId(null);
    }
  };

  const handleSendReminder = async (invoice: InvoiceMetadata) => {
    setInvoiceMenuId(null);
    setRemindingInvoiceId(invoice.id);
    try {
      const result = await superAdminPortalService.sendInvoiceReminder(invoice.id);
      updateFromMutation(result, "info");
    } finally {
      setRemindingInvoiceId(null);
    }
  };

  const handleDownloadPdf = async (invoice: InvoiceMetadata) => {
    setInvoiceMenuId(null);
    setDownloadingInvoiceId(invoice.id);
    try {
      const result = await superAdminPortalService.downloadInvoicePdf(invoice.id);
      const downloadUrl = window.URL.createObjectURL(result.blob);
      const anchor = document.createElement("a");
      anchor.href = downloadUrl;
      anchor.download = result.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(downloadUrl);
      pushToast(`Đã chuẩn bị file PDF cho ${invoice.invoiceCode}.`, "success");
    } catch (error) {
      pushToast(
        error instanceof Error
          ? error.message
          : `Không thể tạo PDF cho ${invoice.invoiceCode}.`,
        "error",
      );
    } finally {
      setDownloadingInvoiceId(null);
    }
  };

  const handleSubmitDraftInvoice = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!draftEditorInvoice) {
      return;
    }

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const nextErrors = validateDraftInvoiceForm(draftInvoiceForm);
    setDraftInvoiceErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      pushToast("Bản nháp hóa đơn còn thiếu thông tin hoặc chưa hợp lệ.", "error");
      return;
    }

    const payload: DraftInvoiceUpdateInput = {
      discountVnd: Number(draftInvoiceForm.discountVnd),
      additionalSeatFeeVnd: Number(draftInvoiceForm.additionalSeatFeeVnd),
      summaryNote: draftInvoiceForm.summaryNote.trim(),
      dueAt: new Date(draftInvoiceForm.dueAt).toISOString(),
    };

    setEditingDraftInvoiceId(draftEditorInvoice.id);
    try {
      const result = await superAdminPortalService.updateDraftInvoice(
        draftEditorInvoice.id,
        payload,
      );
      updateFromMutation(result);

      if (result.success) {
        closeDraftEditor();
      }
    } finally {
      setEditingDraftInvoiceId(null);
    }
  };

  const handleCancelDraftInvoice = async (invoice: InvoiceMetadata) => {
    setInvoiceMenuId(null);
    setCancelingDraftInvoiceId(invoice.id);
    try {
      const result = await superAdminPortalService.cancelDraftInvoice(invoice.id);
      updateFromMutation(result);

      if (draftEditorInvoice?.id === invoice.id && result.success) {
        closeDraftEditor();
      }
    } finally {
      setCancelingDraftInvoiceId(null);
    }
  };

  const validateSupportRequestForm = (
    form: SupportTicketFormState,
  ): SupportTicketFormErrors => {
    const errors: SupportTicketFormErrors = {};
    const durationHours = Number(form.durationHours);

    if (!form.tenantId.trim()) {
      errors.tenantId = "Vui lòng chọn Tenant cần xin quyền hỗ trợ.";
    }

    if (!Number.isFinite(durationHours) || durationHours <= 0) {
      errors.durationHours = "Thời lượng xin quyền phải lớn hơn 0 giờ.";
    }

    if (!form.requestedScope.trim()) {
      errors.requestedScope = "Vui lòng nhập lý do xin quyền chi tiết.";
    }

    return errors;
  };

  const openSupportRequestDialog = () => {
    setSupportRequestErrors({});
    setSupportRequestForm((current) =>
      current.tenantId
        ? current
        : {
            ...INITIAL_SUPPORT_TICKET_FORM,
            tenantId: tenants[0]?.id ?? "",
          },
    );
    setSupportRequestOpen(true);
  };

  const closeSupportRequestDialog = () => {
    setSupportRequestOpen(false);
    setSupportRequestErrors({});
    setSupportRequestForm(INITIAL_SUPPORT_TICKET_FORM);
  };

  const handleSupportRequestChange = <K extends keyof SupportTicketFormState>(
    field: K,
    value: SupportTicketFormState[K],
  ) => {
    setSupportRequestForm((current) => ({ ...current, [field]: value }));
    setSupportRequestErrors((current) => clearFieldError(current, field));
  };

  const handleSubmitSupportRequest = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    const nextErrors = validateSupportRequestForm(supportRequestForm);
    setSupportRequestErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      pushToast("Yêu cầu hỗ trợ còn thiếu thông tin bắt buộc.", "error");
      return;
    }

    const payload: SupportTicketCreateInput = {
      tenantId: supportRequestForm.tenantId.trim(),
      durationHours: Number(supportRequestForm.durationHours),
      requestedScope: supportRequestForm.requestedScope.trim(),
      requestedBy: user?.fullName || "NexaHR Super Admin",
      requestedByEmail: user?.email,
    };

    setCreatingSupportTicket(true);
    try {
      const result = await superAdminPortalService.createSupportTicket(payload);
      updateFromMutation(result);

      if (result.success) {
        closeSupportRequestDialog();
      }
    } finally {
      setCreatingSupportTicket(false);
    }
  };

  const handleActivateSupportTicket = async (ticketId: string) => {
    setActivatingSupportTicketId(ticketId);
    try {
      const result = await superAdminPortalService.activateSupportGrant(ticketId);
      updateFromMutation(result);

      if (result.success && result.record?.sessionLaunchUrl) {
        const popup = window.open(result.record.sessionLaunchUrl, "_blank", "noopener,noreferrer");
        if (!popup) {
          pushToast(
            "Phiên hỗ trợ đã được kích hoạt nhưng trình duyệt đang chặn mở tab mới. Vui lòng cho phép popup để SSO vào Tenant.",
            "info",
          );
        }
      }
    } finally {
      setActivatingSupportTicketId(null);
    }
  };

  const handleRevokeSupportTicket = async (ticketId: string) => {
    setRevokingSupportTicketId(ticketId);
    try {
      const result = await superAdminPortalService.revokeSupportGrant(ticketId);
      updateFromMutation(result);
    } finally {
      setRevokingSupportTicketId(null);
    }
  };

  const handleCreateOwner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!event.currentTarget.reportValidity()) {
      return;
    }

    if (!canSubmitOwnerForm) {
      pushToast(
        workspaceCodeFormatError ||
          (workspaceCodeConflict
            ? "Mã Workspace đang bị trùng. Vui lòng chọn mã khác trước khi tạo lời mời."
            : ownerEmailError || "Biểu mẫu chưa hợp lệ. Vui lòng kiểm tra lại."),
        "error",
      );
      return;
    }

    setSaving(true);
    try {
      const result = await superAdminPortalService.createWorkspaceOwner({
        ...ownerForm,
        companyName: ownerForm.companyName.trim(),
        workspaceCode: normalizedWorkspaceCode,
        ownerFullName: ownerForm.ownerFullName.trim(),
        ownerEmail: normalizedOwnerEmail,
        ownerPhone: ownerForm.ownerPhone.trim(),
        note: ownerForm.note?.trim(),
      });

      updateFromMutation(result);

      if (result.success && result.record) {
        setOwnerForm(INITIAL_OWNER_FORM);
        setSelectedWorkspaceCode(result.record.workspaceCode);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (owner: WorkspaceOwnerProvisioning) => {
    if (owner.status !== "invited" || !owner.activationLink) {
      pushToast(
        "Chỉ có thể sao chép liên kết kích hoạt còn hiệu lực. Hãy gửi lại lời mời nếu token đã hết hạn.",
        "error",
      );
      return;
    }

    try {
      await navigator.clipboard.writeText(owner.activationLink);
      pushToast(`Đã sao chép liên kết kích hoạt cho ${owner.workspaceCode}.`, "success");
    } catch {
      pushToast(
        "Không thể truy cập clipboard. Bạn vẫn có thể sao chép tay từ URL hiển thị trên card.",
        "info",
      );
    }
  };

  const handleOwnerAction = async (
    ownerId: string,
    kind: "resend" | "revoke",
  ) => {
    setPendingOwnerAction({ ownerId, kind });

    try {
      const result =
        kind === "resend"
          ? await superAdminPortalService.resendWorkspaceOwnerInvite(ownerId)
          : await superAdminPortalService.revokeWorkspaceOwnerInvite(ownerId);

      updateFromMutation(result);
    } finally {
      setPendingOwnerAction(null);
    }
  };

  if (loading || !snapshot) {
    return (
      <main className="super-admin-app">
        <div className="super-admin-orb sa-orb-1" />
        <div className="super-admin-orb sa-orb-2" />
        <section className="loading-card sa-loading-shell">
          <div className="loading-spinner" />
          <h2>Đang tải dữ liệu Control Plane...</h2>
          <p>Chuẩn bị trải nghiệm quản trị SaaS và các hợp đồng API...</p>
        </section>
      </main>
    );
  }

  return (
    <main className="super-admin-app">
      <div className="super-admin-orb sa-orb-1" />
      <div className="super-admin-orb sa-orb-2" />

      {toasts.length > 0 ? (
        <section className="sa-toast-stack" aria-live="polite">
          {toasts.map((toast) => (
            <article key={toast.id} className={`sa-toast sa-toast--${toast.kind}`}>
              <p>{toast.message}</p>
              <button
                type="button"
                className="ghost-icon-button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Đóng thông báo"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </article>
          ))}
        </section>
      ) : null}

      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">
            <span className="material-symbols-outlined">verified_user</span>
          </div>
          <div>
            <h1 className="brand-title">NexaHR Super Admin</h1>
            <p className="brand-copy">Hệ thống quản trị</p>
          </div>
        </div>

        <nav className="tab-switcher">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`tab-switcher-button ${activeTab === tab.id ? "is-active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {user ? (
          <div className="topbar-session">
            <div className="identity-avatar">{getInitials(user.fullName)}</div>
            <div className="identity-info">
              <p className="identity-name">{user.fullName}</p>
              <p className="identity-role">{user.email}</p>
            </div>
            {onLogout ? (
              <button
                type="button"
                className="ghost-icon-button"
                onClick={onLogout}
                aria-label="Đăng xuất"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            ) : null}
          </div>
        ) : null}
      </header>

      <section className="summary-grid">
        <article className="summary-card">
          <div className="summary-head">
            <span style={{ color: "var(--sa-sky)" }}>Lời mời mới</span>
            <span className="material-symbols-outlined" style={{ color: "var(--sa-sky)" }}>
              person_add
            </span>
          </div>
          <strong>
            {formatNumber(
              workspaceOwners.filter((owner) => resolveWorkspaceOwnerStatus(owner) === "invited").length,
            )}
          </strong>
        </article>
        <article className="summary-card">
          <div className="summary-head">
            <span style={{ color: "var(--sa-emerald)" }}>MRR dự kiến</span>
            <span className="material-symbols-outlined" style={{ color: "var(--sa-emerald)" }}>
              payments
            </span>
          </div>
          <strong>{formatCurrency(monthlyRecurringRevenue)}</strong>
        </article>
        <article className="summary-card">
          <div className="summary-head">
            <span style={{ color: "var(--sa-amber)" }}>Cảnh báo Quota</span>
            <span className="material-symbols-outlined" style={{ color: "var(--sa-amber)" }}>
              database
            </span>
          </div>
          <strong>{formatNumber(tenants.filter((tenant) => getUsagePercent(tenant) >= 85).length)}</strong>
        </article>
        <article className="summary-card">
          <div className="summary-head">
            <span style={{ color: "var(--sa-rose)" }}>Phiên hỗ trợ</span>
            <span className="material-symbols-outlined" style={{ color: "var(--sa-rose)" }}>
              shield_lock
            </span>
          </div>
          <strong>{formatNumber(supportGrants.filter((grant) => grant.status === "granted").length)}</strong>
        </article>
      </section>

      <section className="sa-flash-banner">
        <span className="material-symbols-outlined">info</span>
        <p>{SECURITY_BOUNDARY_MESSAGE}</p>
      </section>

      <section className="toolbar-panel">
        <div className="search-field">
          <span className="material-symbols-outlined">search</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder={searchPlaceholder}
          />
        </div>
        <div className="toolbar-controls">
          {activeTab === "owners" ? (
            <select
              value={ownerStatusFilter}
              onChange={(event) =>
                setOwnerStatusFilter(event.target.value as WorkspaceOwnerProvisioningStatus | "all")
              }
            >
              <option value="all">Tất cả trạng thái mời</option>
              <option value="invited">Đã mời</option>
              <option value="activated">Đã kích hoạt</option>
              <option value="expired">Hết hạn</option>
              <option value="revoked">Đã thu hồi</option>
            </select>
          ) : null}
          {activeTab === "tenants" ? (
            <select
              value={tenantStatusFilter}
              onChange={(event) =>
                setTenantStatusFilter(event.target.value as TenantSubscription["subscriptionStatus"] | "all")
              }
            >
              <option value="all">Tất cả trạng thái thuê</option>
              <option value="trial">Dùng thử</option>
              <option value="active">Hoạt động</option>
              <option value="past_due">Quá hạn</option>
              <option value="suspended">Tạm dừng</option>
            </select>
          ) : null}
          {activeTab === "plans" ? (
            <>
              <select
                value={planStatusFilter}
                onChange={(event) =>
                  setPlanStatusFilter(event.target.value as SubscriptionPlanStatus | "all")
                }
              >
                <option value="all">Tất cả trạng thái gói</option>
                <option value="active">{planStatusLabel("active")}</option>
                <option value="hidden">{planStatusLabel("hidden")}</option>
              </select>
              <button type="button" className="primary-button" onClick={openCreatePlanEditor}>
                <span className="material-symbols-outlined">add</span>
                + Tạo gói mới
              </button>
            </>
          ) : null}
          {activeTab === "billing" ? (
            <select
              value={billingFilter}
              onChange={(event) => setBillingFilter(event.target.value as BillingStatus | "all")}
            >
              <option value="all">Tất cả trạng thái thanh toán</option>
              <option value="draft">Bản nháp</option>
              <option value="upcoming">Sắp tới</option>
              <option value="paid">Đã thanh toán</option>
              <option value="overdue">Quá hạn</option>
            </select>
          ) : null}
          {activeTab === "support" ? (
            <>
              <select
                value={supportFilter}
                onChange={(event) =>
                  setSupportFilter(event.target.value as SupportAccessStatus | "all")
                }
              >
                <option value="all">Tất cả ticket hỗ trợ</option>
                <option value="granted">Đã cấp quyền</option>
                <option value="pending_customer_approval">Chờ khách hàng phê duyệt</option>
                <option value="expired">Hết hạn</option>
              </select>
              <button
                type="button"
                className="primary-button"
                disabled={tenants.length === 0}
                onClick={openSupportRequestDialog}
              >
                <span className="material-symbols-outlined">add</span>
                + Tạo yêu cầu hỗ trợ
              </button>
            </>
          ) : null}
        </div>
      </section>

      {activeTab === "owners" ? (
        <WorkspaceOwnersPanel
          plans={onboardingPlans}
          owners={filteredOwners}
          form={ownerForm}
          saving={saving}
          canSubmit={canSubmitOwnerForm}
          currency={formatCurrency}
          dateTime={formatDateTime}
          toneClass={getToneClass}
          billingCycleLabel={BILLING_CYCLE_LABELS[ownerForm.billingCycle]}
          projectedMonthlyRevenue={projectedMonthlyRevenue}
          projectedCycleAmount={projectedCycleAmount}
          workspaceCodeMessage={workspaceCodeMessage}
          workspaceCodeMessageTone={workspaceCodeMessageTone}
          ownerEmailError={ownerEmailError}
          pendingOwnerAction={pendingOwnerAction}
          onChange={handleFormChange}
          onSubmit={handleCreateOwner}
          onCopy={(owner) => void handleCopy(owner)}
          onResend={(ownerId) => void handleOwnerAction(ownerId, "resend")}
          onRevoke={(ownerId) => void handleOwnerAction(ownerId, "revoke")}
        />
      ) : null}

      {activeTab === "tenants" ? (
        <TenantsPanel
          tenants={tenantDirectory}
          loading={tenantDirectoryLoading}
          selectedTenant={selectedTenant}
          dateTime={formatDateTime}
          toneClass={getToneClass}
          usagePercent={getUsagePercent}
          onSelect={setSelectedWorkspaceCode}
        />
      ) : null}

      {activeTab === "plans" ? (
        <PlansPanel
          plans={planCatalog}
          loading={planCatalogLoading}
          currency={formatCurrency}
          form={planForm}
          errors={planFormErrors}
          featureOptions={planFeatureOptions}
          editorMode={planEditorMode}
          editorOpen={planEditorOpen}
          saving={savingPlan}
          menuPlanId={planMenuId}
          pendingDeletePlan={pendingPlanDelete}
          deletingPlanId={deletingPlanId}
          tenantUsageCount={tenantUsageCount}
          onToggleMenu={setPlanMenuId}
          onOpenEdit={openEditPlanEditor}
          onCloseEditor={resetPlanForm}
          onChange={handlePlanFormChange}
          onToggleFeature={handlePlanFeatureToggle}
          onSubmit={handlePlanSubmit}
          onRequestDelete={setPendingPlanDelete}
          onCancelDelete={() => {
            if (deletingPlanId) {
              return;
            }

            setPendingPlanDelete(null);
          }}
          onConfirmDelete={() => void handlePlanDeleteConfirm()}
        />
      ) : null}

      {activeTab === "billing" ? (
        <BillingPanel
          invoices={billingPage.items}
          loading={billingLoading}
          page={billingPage.page}
          total={billingPage.total}
          totalPages={billingPage.totalPages}
          currency={formatCurrency}
          dateTime={formatDateTime}
          toneClass={getToneClass}
          menuInvoiceId={invoiceMenuId}
          paymentDialogInvoice={paymentDialogInvoice}
          paymentForm={manualPaymentForm}
          paymentErrors={manualPaymentErrors}
          draftEditorInvoice={draftEditorInvoice}
          draftForm={draftInvoiceForm}
          draftErrors={draftInvoiceErrors}
          markingInvoiceId={markingInvoiceId}
          remindingInvoiceId={remindingInvoiceId}
          downloadingInvoiceId={downloadingInvoiceId}
          editingDraftInvoiceId={editingDraftInvoiceId}
          cancelingDraftInvoiceId={cancelingDraftInvoiceId}
          onToggleMenu={setInvoiceMenuId}
          onOpenPaymentDialog={openPaymentDialog}
          onClosePaymentDialog={closePaymentDialog}
          onPaymentChange={handleManualPaymentChange}
          onSubmitPayment={handleSubmitManualPayment}
          onSendReminder={(invoice) => void handleSendReminder(invoice)}
          onDownloadPdf={(invoice) => void handleDownloadPdf(invoice)}
          onOpenDraftEditor={openDraftEditor}
          onCloseDraftEditor={closeDraftEditor}
          onDraftChange={handleDraftInvoiceChange}
          onSubmitDraft={handleSubmitDraftInvoice}
          onCancelDraft={(invoice) => void handleCancelDraftInvoice(invoice)}
          onPageChange={setBillingPageIndex}
        />
      ) : null}

      {activeTab === "support" ? (
        <SupportPanel
          grants={supportDirectory}
          tenants={tenants}
          loading={supportLoading}
          requestOpen={supportRequestOpen}
          requestForm={supportRequestForm}
          requestErrors={supportRequestErrors}
          creatingRequest={creatingSupportTicket}
          activatingTicketId={activatingSupportTicketId}
          revokingTicketId={revokingSupportTicketId}
          dateTime={formatDateTime}
          toneClass={getToneClass}
          onCloseRequest={closeSupportRequestDialog}
          onRequestChange={handleSupportRequestChange}
          onSubmitRequest={handleSubmitSupportRequest}
          onActivate={(ticketId) => void handleActivateSupportTicket(ticketId)}
          onRevoke={(ticketId) => void handleRevokeSupportTicket(ticketId)}
        />
      ) : null}
    </main>
  );
}
