import { startTransition, useDeferredValue, useEffect, useMemo, useState, type FormEvent } from "react";
import { WorkspaceOwnersPanel } from "./control-plane/WorkspaceOwnersPanel";
import { TenantsPanel } from "./control-plane/TenantsPanel";
import { BillingPanel, PlansPanel, SupportPanel } from "./control-plane/CatalogPanels";
import "./PortalControlPlane.css";
import type { BillingStatus, SupportAccessStatus, TenantSubscription } from "./types";
import {
  superAdminPortalService,
  type ControlPlaneSnapshot,
  type WorkspaceOwnerCreateInput,
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

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});
const numberFormatter = new Intl.NumberFormat("vi-VN");

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatNumber = (value: number) => numberFormatter.format(value);
const formatDateTime = (value?: string) =>
  value ? new Date(value).toLocaleString("vi-VN") : "N/A";

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

export default function PortalControlPlane({ user, onLogout }: PortalControlPlaneProps) {
  const [snapshot, setSnapshot] = useState<ControlPlaneSnapshot | null>(null);
  const [activeTab, setActiveTab] = useState<TabId>("owners");
  const [searchTerm, setSearchTerm] = useState("");
  const [ownerStatusFilter, setOwnerStatusFilter] = useState<WorkspaceOwnerProvisioningStatus | "all">("all");
  const [tenantStatusFilter, setTenantStatusFilter] = useState<TenantSubscription["subscriptionStatus"] | "all">("all");
  const [billingFilter, setBillingFilter] = useState<BillingStatus | "all">("all");
  const [supportFilter, setSupportFilter] = useState<SupportAccessStatus | "all">("all");
  const [ownerForm, setOwnerForm] = useState<WorkspaceOwnerCreateInput>(INITIAL_OWNER_FORM);
  const [selectedWorkspaceCode, setSelectedWorkspaceCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flashMessage, setFlashMessage] = useState(
    "SuperAdmin chỉ quản lý metadata mức Control Plane. Dữ liệu nghiệp vụ của Tenant luôn được khóa trừ khi có quyền hỗ trợ.",
  );
  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase());

  useEffect(() => {
    let isMounted = true;
    const loadSnapshot = async () => {
      setLoading(true);
      const nextSnapshot = await superAdminPortalService.fetchControlPlaneSnapshot();
      if (!isMounted) return;
      startTransition(() => {
        setSnapshot(nextSnapshot);
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
  const invoices = snapshot?.invoices ?? [];
  const supportGrants = snapshot?.supportGrants ?? [];
  const workspaceOwners = snapshot?.workspaceOwners ?? [];

  const filteredOwners = useMemo(
    () =>
      workspaceOwners.filter((owner) => {
        const matchesSearch =
          deferredSearch.length === 0 ||
          owner.companyName.toLowerCase().includes(deferredSearch) ||
          owner.workspaceCode.toLowerCase().includes(deferredSearch) ||
          owner.ownerEmail.toLowerCase().includes(deferredSearch);
        return matchesSearch && (ownerStatusFilter === "all" || owner.status === ownerStatusFilter);
      }),
    [deferredSearch, ownerStatusFilter, workspaceOwners],
  );

  const filteredTenants = useMemo(
    () =>
      tenants.filter((tenant) => {
        const matchesSearch =
          deferredSearch.length === 0 ||
          tenant.companyName.toLowerCase().includes(deferredSearch) ||
          tenant.workspaceCode.toLowerCase().includes(deferredSearch) ||
          tenant.portalAdminEmail.toLowerCase().includes(deferredSearch);
        return matchesSearch && (tenantStatusFilter === "all" || tenant.subscriptionStatus === tenantStatusFilter);
      }),
    [deferredSearch, tenantStatusFilter, tenants],
  );

  const filteredInvoices = useMemo(
    () =>
      invoices.filter((invoice) => {
        const matchesSearch =
          deferredSearch.length === 0 ||
          invoice.companyName.toLowerCase().includes(deferredSearch) ||
          invoice.workspaceCode.toLowerCase().includes(deferredSearch) ||
          invoice.invoiceCode.toLowerCase().includes(deferredSearch);
        return matchesSearch && (billingFilter === "all" || invoice.status === billingFilter);
      }),
    [billingFilter, deferredSearch, invoices],
  );

  const filteredSupport = useMemo(
    () =>
      supportGrants.filter((grant) => {
        const matchesSearch =
          deferredSearch.length === 0 ||
          grant.companyName.toLowerCase().includes(deferredSearch) ||
          grant.workspaceCode.toLowerCase().includes(deferredSearch) ||
          grant.ticketId.toLowerCase().includes(deferredSearch);
        return matchesSearch && (supportFilter === "all" || grant.status === supportFilter);
      }),
    [deferredSearch, supportFilter, supportGrants],
  );

  const selectedTenant =
    filteredTenants.find((tenant) => tenant.workspaceCode === selectedWorkspaceCode) ??
    filteredTenants[0] ??
    null;

  const monthlyRecurringRevenue = tenants.reduce((total, tenant) => {
    const plan = plans.find((item) => item.code === tenant.planCode);
    return total + (plan?.monthlyPriceVnd ?? 0);
  }, 0);

  const updateSnapshot = (nextSnapshot: ControlPlaneSnapshot, message: string) => {
    startTransition(() => {
      setSnapshot(nextSnapshot);
      setSelectedWorkspaceCode((current) => current || nextSnapshot.tenants[0]?.workspaceCode || "");
    });
    setFlashMessage(message);
  };

  const handleFormChange = <K extends keyof WorkspaceOwnerCreateInput>(
    field: K,
    value: WorkspaceOwnerCreateInput[K],
  ) => setOwnerForm((current) => ({ ...current, [field]: value }));

  const handleCreateOwner = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    try {
      const result = await superAdminPortalService.createWorkspaceOwner({
        ...ownerForm,
        workspaceCode: ownerForm.workspaceCode.trim().toUpperCase(),
        ownerEmail: ownerForm.ownerEmail.trim().toLowerCase(),
      });
      updateSnapshot(result.snapshot, result.message);
      if (result.success && result.record) {
        setOwnerForm(INITIAL_OWNER_FORM);
        setSelectedWorkspaceCode(result.record.workspaceCode);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCopy = async (owner: { workspaceCode: string; activationLink: string }) => {
    try {
      await navigator.clipboard.writeText(owner.activationLink);
      setFlashMessage(`Đã sao chép liên kết kích hoạt cho ${owner.workspaceCode}.`);
    } catch {
      setFlashMessage(`Liên kết kích hoạt: ${owner.activationLink}`);
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
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark"><span className="material-symbols-outlined">verified_user</span></div>
          <div><h1 className="brand-title">NexaHR Super Admin</h1><p className="brand-copy">Hệ thống quản trị</p></div>
        </div>
        <nav className="tab-switcher">
          {tabs.map((tab) => (
            <button key={tab.id} type="button" className={`tab-switcher-button ${activeTab === tab.id ? "is-active" : ""}`} onClick={() => setActiveTab(tab.id)}>
              <span className="material-symbols-outlined">{tab.icon}</span>{tab.label}
            </button>
          ))}
        </nav>
        {user ? (
          <div className="topbar-session">
            <div className="identity-avatar">{getInitials(user.fullName)}</div>
            <div className="identity-info"><p className="identity-name">{user.fullName}</p><p className="identity-role">{user.email}</p></div>
            {onLogout ? <button type="button" className="ghost-icon-button" onClick={onLogout}><span className="material-symbols-outlined">logout</span></button> : null}
          </div>
        ) : null}
      </header>



      <section className="summary-grid">
        <article className="summary-card"><div className="summary-head"><span style={{ color: "var(--sa-sky)" }}>Lời mời mới</span><span className="material-symbols-outlined" style={{ color: "var(--sa-sky)" }}>person_add</span></div><strong>{formatNumber(workspaceOwners.filter((owner) => owner.status === "invited").length)}</strong></article>
        <article className="summary-card"><div className="summary-head"><span style={{ color: "var(--sa-emerald)" }}>MRR Dự kiến</span><span className="material-symbols-outlined" style={{ color: "var(--sa-emerald)" }}>payments</span></div><strong>{formatCurrency(monthlyRecurringRevenue)}</strong></article>
        <article className="summary-card"><div className="summary-head"><span style={{ color: "var(--sa-amber)" }}>Cảnh báo Quota</span><span className="material-symbols-outlined" style={{ color: "var(--sa-amber)" }}>database</span></div><strong>{formatNumber(tenants.filter((tenant) => getUsagePercent(tenant) >= 85).length)}</strong></article>
        <article className="summary-card"><div className="summary-head"><span style={{ color: "var(--sa-rose)" }}>Phiên hỗ trợ</span><span className="material-symbols-outlined" style={{ color: "var(--sa-rose)" }}>shield_lock</span></div><strong>{formatNumber(supportGrants.filter((grant) => grant.status === "granted").length)}</strong></article>
      </section>

      <section className="sa-flash-banner"><span className="material-symbols-outlined">info</span><p>{flashMessage}</p></section>

      <section className="toolbar-panel">
        <div className="search-field"><span className="material-symbols-outlined">search</span><input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Tìm kiếm Tenant, Workspace, Email, Hóa đơn..." /></div>
        <div className="toolbar-controls">
          {activeTab === "owners" ? <select value={ownerStatusFilter} onChange={(event) => setOwnerStatusFilter(event.target.value as WorkspaceOwnerProvisioningStatus | "all")}><option value="all">Tất cả trạng thái mời</option><option value="invited">Đã mời</option><option value="activated">Đã kích hoạt</option><option value="expired">Hết hạn</option><option value="revoked">Đã thu hồi</option></select> : null}
          {activeTab === "tenants" ? <select value={tenantStatusFilter} onChange={(event) => setTenantStatusFilter(event.target.value as TenantSubscription["subscriptionStatus"] | "all")}><option value="all">Tất cả trạng thái thuê</option><option value="trial">Dùng thử</option><option value="active">Hoạt động</option><option value="past_due">Quá hạn</option><option value="suspended">Tạm dừng</option></select> : null}
          {activeTab === "billing" ? <select value={billingFilter} onChange={(event) => setBillingFilter(event.target.value as BillingStatus | "all")}><option value="all">Tất cả trạng thái thanh toán</option><option value="paid">Đã thanh toán</option><option value="upcoming">Sắp tới</option><option value="overdue">Quá hạn</option><option value="draft">Bản nháp</option></select> : null}
          {activeTab === "support" ? <select value={supportFilter} onChange={(event) => setSupportFilter(event.target.value as SupportAccessStatus | "all")}><option value="all">Tất cả trạng thái hỗ trợ</option><option value="not_requested">Bị khóa mặc định</option><option value="pending_customer_approval">Chờ phê duyệt</option><option value="granted">Đã cấp quyền</option><option value="expired">Hết hạn</option><option value="revoked">Đã thu hồi</option></select> : null}
        </div>
      </section>

      {activeTab === "owners" ? <WorkspaceOwnersPanel plans={plans} owners={filteredOwners} form={ownerForm} saving={saving} currency={formatCurrency} dateTime={formatDateTime} toneClass={getToneClass} onChange={handleFormChange} onSubmit={handleCreateOwner} onCopy={(owner) => void handleCopy(owner)} onResend={async (ownerId) => { const result = await superAdminPortalService.resendWorkspaceOwnerInvite(ownerId); updateSnapshot(result.snapshot, result.message); }} onRevoke={async (ownerId) => { const result = await superAdminPortalService.revokeWorkspaceOwnerInvite(ownerId); updateSnapshot(result.snapshot, result.message); }} onFilter={setOwnerStatusFilter} filter={ownerStatusFilter} /> : null}
      {activeTab === "tenants" ? <TenantsPanel tenants={filteredTenants} selectedTenant={selectedTenant} dateTime={formatDateTime} toneClass={getToneClass} usagePercent={getUsagePercent} onSelect={setSelectedWorkspaceCode} /> : null}
      {activeTab === "plans" ? <PlansPanel plans={plans} currency={formatCurrency} /> : null}
      {activeTab === "billing" ? <BillingPanel invoices={filteredInvoices} currency={formatCurrency} dateTime={formatDateTime} toneClass={getToneClass} /> : null}
      {activeTab === "support" ? <SupportPanel grants={filteredSupport} dateTime={formatDateTime} toneClass={getToneClass} onActivate={async (ticketId) => { const result = await superAdminPortalService.activateSupportGrant(ticketId); updateSnapshot(result.snapshot, result.message); }} onRevoke={async (ticketId) => { const result = await superAdminPortalService.revokeSupportGrant(ticketId); updateSnapshot(result.snapshot, result.message); }} /> : null}
    </main>
  );
}
