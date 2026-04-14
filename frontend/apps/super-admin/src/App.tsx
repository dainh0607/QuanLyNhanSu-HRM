// @ts-nocheck
import { useDeferredValue, useState } from "react";
import "./App.css";

interface PortalUser {
  fullName?: string;
  email?: string;
}

interface AppProps {
  user?: PortalUser | null;
  onLogout?: () => void;
}
import {
  initialSupportGrants,
  initialTenants,
  invoiceMetadata,
  subscriptionPlans,
} from "./data";
import type {
  BillingStatus,
  PortalTab,
  SubscriptionStatus,
  SupportAccessStatus,
  SupportGrant,
  TenantSubscription,
} from "./types";

const tabs: Array<{ id: PortalTab; label: string; icon: string }> = [
  { id: "tenants", label: "Danh bạ Tenant", icon: "domain" },
  { id: "plans", label: "Gói cước", icon: "inventory_2" },
  { id: "billing", label: "Thanh toán", icon: "receipt_long" },
  { id: "support", label: "Hỗ trợ", icon: "support_agent" },
];

const currencyFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat("vi-VN");
const dateFormatter = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

const formatCurrency = (value: number) => currencyFormatter.format(value);
const formatNumber = (value: number) => numberFormatter.format(value);
const formatDate = (value?: string) =>
  value ? dateFormatter.format(new Date(value)) : "Chưa có";

const getSubscriptionLabel = (status: SubscriptionStatus) => {
  switch (status) {
    case "trial":
      return "Dùng thử";
    case "active":
      return "Đang hoạt động";
    case "past_due":
      return "Quá hạn";
    case "suspended":
      return "Tạm khóa";
    default:
      return status;
  }
};

const getBillingLabel = (status: BillingStatus) => {
  switch (status) {
    case "paid":
      return "Đã thanh toán";
    case "upcoming":
      return "Sắp đến hạn";
    case "overdue":
      return "Quá hạn";
    case "draft":
      return "Bản nháp";
    default:
      return status;
  }
};

const getSupportLabel = (status: SupportAccessStatus) => {
  switch (status) {
    case "not_requested":
      return "Chưa mở hỗ trợ";
    case "pending_customer_approval":
      return "Chờ kích hoạt";
    case "granted":
      return "Đang có quyền";
    case "expired":
      return "Đã hết hạn";
    case "revoked":
      return "Đã thu hồi";
    default:
      return status;
  }
};

const getOnboardingLabel = (status: TenantSubscription["onboardingStatus"]) => {
  switch (status) {
    case "awaiting_contract":
      return "Chờ hợp đồng";
    case "setup_in_progress":
      return "Đang cấu hình";
    case "ready":
      return "Sẵn sàng bàn giao";
    case "trial":
      return "Dùng thử";
    default:
      return status;
  }
};

const getBillingCycleLabel = (cycle: TenantSubscription["billingCycle"]) => {
  switch (cycle) {
    case "monthly":
      return "Theo tháng";
    case "quarterly":
      return "Theo quý";
    case "yearly":
      return "Theo năm";
    default:
      return cycle;
  }
};

const getUsagePercent = (tenant: TenantSubscription) =>
  Math.min(100, Math.round((tenant.storageUsedGb / tenant.storageLimitGb) * 100));

const getUsageTone = (percent: number) => {
  if (percent >= 90) {
    return "rose";
  }

  if (percent >= 75) {
    return "amber";
  }

  return "emerald";
};

const getTone = (
  type: "subscription" | "billing" | "support",
  value: string,
): string => {
  if (type === "subscription") {
    if (value === "active") return "emerald";
    if (value === "trial") return "sky";
    if (value === "past_due") return "rose";
    return "amber";
  }

  if (type === "billing") {
    if (value === "paid") return "emerald";
    if (value === "upcoming") return "sky";
    if (value === "overdue") return "rose";
    return "amber";
  }

  if (value === "granted") return "amber";
  if (value === "pending_customer_approval") return "sky";
  if (value === "not_requested") return "slate";
  return "rose";
};

const getInitials = (fullName: string | undefined) => {
  if (!fullName) return "SA";
  const names = fullName.trim().split(/\s+/).filter(Boolean);
  if (names.length >= 2) return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  return names[0]?.slice(0, 2).toUpperCase() ?? "SA";
};

function App({ user, onLogout }: AppProps) {
  const [activeTab, setActiveTab] = useState<PortalTab>("tenants");
  const [searchTerm, setSearchTerm] = useState("");
  const [subscriptionFilter, setSubscriptionFilter] = useState<
    SubscriptionStatus | "all"
  >("all");
  const [billingFilter, setBillingFilter] = useState<BillingStatus | "all">(
    "all",
  );
  const [supportFilter, setSupportFilter] = useState<
    SupportAccessStatus | "all"
  >("all");
  const [tenants, setTenants] = useState<TenantSubscription[]>(initialTenants);
  const [supportGrants, setSupportGrants] =
    useState<SupportGrant[]>(initialSupportGrants);
  const [selectedTenantId, setSelectedTenantId] = useState<string>(
    initialTenants[0]?.id ?? "",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [flashMessage, setFlashMessage] = useState(
    "SuperAdmin vận hành metadata dịch vụ. Quyền hỗ trợ tenant mặc định bị khóa.",
  );
  const deferredSearch = useDeferredValue(searchTerm.trim().toLowerCase());

  const filteredTenants = tenants.filter((tenant) => {
    const matchesSearch =
      deferredSearch.length === 0 ||
      tenant.companyName.toLowerCase().includes(deferredSearch) ||
      tenant.workspaceCode.toLowerCase().includes(deferredSearch) ||
      tenant.portalAdminEmail.toLowerCase().includes(deferredSearch);
    const matchesStatus =
      subscriptionFilter === "all" ||
      tenant.subscriptionStatus === subscriptionFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredInvoices = invoiceMetadata.filter((invoice) => {
    const matchesSearch =
      deferredSearch.length === 0 ||
      invoice.companyName.toLowerCase().includes(deferredSearch) ||
      invoice.workspaceCode.toLowerCase().includes(deferredSearch) ||
      invoice.invoiceCode.toLowerCase().includes(deferredSearch);
    const matchesStatus =
      billingFilter === "all" || invoice.status === billingFilter;

    return matchesSearch && matchesStatus;
  });

  const filteredSupportGrants = supportGrants.filter((grant) => {
    const matchesSearch =
      deferredSearch.length === 0 ||
      grant.companyName.toLowerCase().includes(deferredSearch) ||
      grant.workspaceCode.toLowerCase().includes(deferredSearch) ||
      grant.ticketId.toLowerCase().includes(deferredSearch);
    const matchesStatus =
      supportFilter === "all" || grant.status === supportFilter;

    return matchesSearch && matchesStatus;
  });

  const selectedTenant =
    filteredTenants.find((tenant) => tenant.id === selectedTenantId) ??
    filteredTenants[0] ??
    null;
  const selectedPlan =
    subscriptionPlans.find((plan) => plan.code === selectedTenant?.planCode) ??
    null;

  const monthlyRecurringRevenue = tenants.reduce((total, tenant) => {
    const matchingPlan = subscriptionPlans.find((plan) => plan.code === tenant.planCode);
    return total + (matchingPlan?.monthlyPriceVnd ?? 0);
  }, 0);
  const highUsageTenants = tenants.filter((tenant) => getUsagePercent(tenant) >= 85);
  const activeSupportCount = supportGrants.filter(
    (grant) => grant.status === "granted",
  ).length;
  const readyTenants = tenants.filter(
    (tenant) => tenant.onboardingStatus === "ready",
  ).length;

  const handleActivateSupport = (grant: SupportGrant) => {
    if (!grant.customerApprovedAt) {
      setFlashMessage(
        `Ticket ${grant.ticketId} chưa có xác nhận từ khách hàng, nên quyền hỗ trợ vẫn bị khóa.`,
      );
      return;
    }

    const expiresAt =
      grant.expiresAt ??
      new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString();

    setSupportGrants((current) =>
      current.map((item) =>
        item.ticketId === grant.ticketId
          ? { ...item, status: "granted", expiresAt }
          : item,
      ),
    );
    setTenants((current) =>
      current.map((tenant) =>
        tenant.workspaceCode === grant.workspaceCode
          ? {
              ...tenant,
              supportTicketId: grant.ticketId,
              supportAccessStatus: "granted",
              supportAccessExpiresAt: expiresAt,
            }
          : tenant,
      ),
    );
    setFlashMessage(
      `Đã mở quyền hỗ trợ có thời hạn cho ${grant.workspaceCode} tới ${formatDate(expiresAt)}.`,
    );
  };

  const handleRevokeSupport = (grant: SupportGrant) => {
    setSupportGrants((current) =>
      current.map((item) =>
        item.ticketId === grant.ticketId
          ? { ...item, status: "revoked", expiresAt: undefined }
          : item,
      ),
    );
    setTenants((current) =>
      current.map((tenant) =>
        tenant.workspaceCode === grant.workspaceCode
          ? {
              ...tenant,
              supportTicketId: undefined,
              supportAccessStatus: "not_requested",
              supportAccessExpiresAt: undefined,
            }
          : tenant,
      ),
    );
    setFlashMessage(
      `Đã thu hồi toàn bộ quyền hỗ trợ trực tiếp với workspace ${grant.workspaceCode}.`,
    );
  };

  return (
    <main className="super-admin-app">
      {/* Background Aesthetic Orbs */}
      <div className="super-admin-orb sa-orb-1" />
      <div className="super-admin-orb sa-orb-2" />

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
              className={`tab-switcher-button ${
                activeTab === tab.id ? "is-active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="material-symbols-outlined">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        {user && (
          <div className="topbar-session">
            <div className="identity-avatar">{getInitials(user.fullName)}</div>
            <div className="identity-info">
              <p className="identity-name">{user.fullName}</p>
              <p className="identity-role">{user.email}</p>
            </div>
            {onLogout && (
              <button
                type="button"
                className="ghost-icon-button"
                onClick={onLogout}
                aria-label="Đăng xuất"
              >
                <span className="material-symbols-outlined">logout</span>
              </button>
            )}
          </div>
        )}
      </header>



      <section className="summary-grid">
        <article className="summary-card">
          <div className="summary-head">
            <span style={{ color: 'var(--sa-sky)' }}>Danh sách Tenant</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--sa-sky)' }}>apartment</span>
          </div>
          <strong>{formatNumber(tenants.length)}</strong>
        </article>

        <article className="summary-card">
          <div className="summary-head">
            <span style={{ color: 'var(--sa-emerald)' }}>MRR Metadata</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--sa-emerald)' }}>payments</span>
          </div>
          <strong>{formatCurrency(monthlyRecurringRevenue)}</strong>
        </article>

        <article className="summary-card">
          <div className="summary-head">
            <span style={{ color: 'var(--sa-amber)' }}>Cảnh báo Quota</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--sa-amber)' }}>database</span>
          </div>
          <strong>{formatNumber(highUsageTenants.length)}</strong>
        </article>

        <article className="summary-card">
          <div className="summary-head">
            <span style={{ color: 'var(--sa-rose)' }}>Quyền hỗ trợ</span>
            <span className="material-symbols-outlined" style={{ color: 'var(--sa-rose)' }}>security</span>
          </div>
          <strong>{formatNumber(activeSupportCount)}</strong>
        </article>
      </section>

      <section className="toolbar-panel">
        <div className="search-field">
          <span className="material-symbols-outlined">search</span>
          <input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm kiếm tenant, workspace, email..."
          />
        </div>

        <div className="toolbar-controls">
          <select
            value={subscriptionFilter}
            onChange={(event) =>
              setSubscriptionFilter(event.target.value as SubscriptionStatus | "all")
            }
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="trial">Dùng thử</option>
            <option value="active">Hoạt động</option>
            <option value="past_due">Quá hạn</option>
          </select>
          {/* Billing & Support filters can be added here if needed */}
        </div>
      </section>

      {activeTab === "tenants" && (
        <section className="tenant-registry-wrapper">
          {filteredTenants.map((tenant) => (
            <button
              key={tenant.id}
              type="button"
              className="tenant-card"
              onClick={() => {
                setSelectedTenantId(tenant.id);
                setIsModalOpen(true);
              }}
            >
              <div className="tenant-card-head">
                <div>
                  <h4>{tenant.companyName}</h4>
                  <p>{tenant.workspaceCode}</p>
                </div>
                <span className={`badge badge--${getTone("subscription", tenant.subscriptionStatus)}`}>
                  {getSubscriptionLabel(tenant.subscriptionStatus)}
                </span>
              </div>

              <div className="tenant-meta">
                <div>
                  <span>Gói dịch vụ</span>
                  <strong>{tenant.planName}</strong>
                </div>
                <div>
                  <span>Admin Email</span>
                  <strong>{tenant.portalAdminEmail}</strong>
                </div>
              </div>

              <div className="storage-block">
                <div className="storage-track">
                  <div
                    className={`storage-fill storage-fill--${getUsageTone(getUsagePercent(tenant))}`}
                    style={{ 
                      width: `${getUsagePercent(tenant)}%`,
                      background: getUsageTone(getUsagePercent(tenant)) === 'emerald' ? 'var(--sa-emerald)' : 'var(--sa-rose)' 
                    }}
                  />
                </div>
              </div>
            </button>
          ))}
        </section>
      )}

      {activeTab === "plans" && (
        <section className="plan-grid">
          {subscriptionPlans.map((plan) => (
            <article key={plan.id} className="panel plan-card">
              <div className="plan-card-head">
                <div>
                  <p className="badge badge--sky">{plan.code}</p>
                  <h3 style={{ marginTop: '8px', fontSize: '24px' }}>{plan.name}</h3>
                </div>
              </div>
              <p className="feature-copy" style={{ margin: '16px 0' }}>{plan.description}</p>
              <div className="price-chip">{formatCurrency(plan.monthlyPriceVnd)}</div>
              <div className="detail-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginTop: '20px' }}>
                <div className="detail-card">
                  <span>Bộ nhớ</span>
                  <strong>{formatNumber(plan.storageLimitGb)} GB</strong>
                </div>
                <div className="detail-card">
                  <span>Giới hạn nhân viên</span>
                  <strong>{formatNumber(plan.employeeSeatLimit)}</strong>
                </div>
              </div>
            </article>
          ))}
        </section>
      )}

      {activeTab === "billing" && (
        <section className="panel billing-panel" style={{ padding: '24px', borderRadius: '24px' }}>
          <div className="table-wrap">
            <table className="billing-table">
              <thead>
                <tr>
                  <th>Hóa đơn</th>
                  <th>Tenant</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>Đến hạn</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <td><strong>{invoice.invoiceCode}</strong></td>
                    <td>{invoice.companyName}</td>
                    <td>{formatCurrency(invoice.amountVnd)}</td>
                    <td>
                      <span className={`badge badge--${getTone("billing", invoice.status)}`}>
                        {getBillingLabel(invoice.status)}
                      </span>
                    </td>
                    <td>{formatDate(invoice.dueAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {activeTab === "support" && (
        <section className="support-list">
          {filteredSupportGrants.map((grant) => (
            <article key={grant.ticketId} className="support-card" style={{ padding: '24px' }}>
              <div className="support-head">
                <div>
                  <h4 style={{ fontSize: '20px' }}>{grant.companyName}</h4>
                  <p>Ticket: {grant.ticketId} · Workspace: {grant.workspaceCode}</p>
                </div>
                <span className={`badge badge--${getTone("support", grant.status)}`}>
                  {getSupportLabel(grant.status)}
                </span>
              </div>
              <div className="support-actions" style={{ marginTop: '20px' }}>
                {grant.status !== "granted" ? (
                  <button className="primary-button" disabled={!grant.customerApprovedAt} onClick={() => handleActivateSupport(grant)}>
                    Kích hoạt hỗ trợ
                  </button>
                ) : (
                  <button className="primary-button" style={{ background: 'var(--sa-rose)' }} onClick={() => handleRevokeSupport(grant)}>
                    Thu hồi quyền
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {/* Tenant Detail Modal */}
      {isModalOpen && selectedTenant && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="badge badge--sky" style={{ marginBottom: '12px' }}>Chi tiết Tenant</span>
                <h2 style={{ fontSize: '32px', fontWeight: 900, letterSpacing: '-0.04em' }}>
                  {selectedTenant.companyName}
                </h2>
                <p style={{ marginTop: '8px', fontSize: '15px' }}>
                  Mã Workspace: {selectedTenant.workspaceCode} · Mã đăng ký: {selectedTenant.subscriptionCode}
                </p>
              </div>
              <button className="close-button" onClick={() => setIsModalOpen(false)}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="modal-body">
              <div className="detail-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                <div className="detail-card">
                  <span>Admin Email</span>
                  <strong>{selectedTenant.portalAdminEmail}</strong>
                </div>
                <div className="detail-card">
                  <span>Trạng thái Onboarding</span>
                  <strong>{getOnboardingLabel(selectedTenant.onboardingStatus)}</strong>
                </div>
                <div className="detail-card">
                  <span>Kỳ gia hạn tiếp theo</span>
                  <strong>{formatDate(selectedTenant.nextRenewalAt)}</strong>
                </div>
                <div className="detail-card">
                  <span>Chế độ cô lập</span>
                  <strong>{selectedTenant.workspaceIsolationMode}</strong>
                </div>
              </div>

              <div className="feature-panel" style={{ marginTop: '32px', padding: '24px', background: 'rgba(255,255,255,0.02)' }}>
                <div className="feature-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--sa-text-main)' }}>
                    Gói dịch vụ: {selectedPlan?.name ?? selectedTenant.planName}
                  </h4>
                  <div className="price-chip">{formatCurrency(selectedPlan?.monthlyPriceVnd ?? 0)}</div>
                </div>
                
                <div className="detail-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div className="detail-card">
                    <span>Giới hạn Admin</span>
                    <strong>{formatNumber(selectedPlan?.adminSeatLimit ?? 0)}</strong>
                  </div>
                  <div className="detail-card">
                    <span>Giới hạn Nhân viên</span>
                    <strong>{formatNumber(selectedPlan?.employeeSeatLimit ?? 0)}</strong>
                  </div>
                </div>
              </div>

              <div className="security-banner" style={{ background: 'rgba(244, 63, 94, 0.05)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: '18px', verticalAlign: 'middle', marginRight: '8px' }}>lock</span>
                Phòng điều khiển Metadata. Mọi quyền truy cập dữ liệu thực tế đều yêu cầu Support Ticket.
              </div>
            </div>

            <div className="modal-footer">
              <button className="primary-button" onClick={() => {
                setActiveTab("support");
                setIsModalOpen(false);
              }}>
                <span className="material-symbols-outlined" style={{ marginRight: '8px' }}>support_agent</span>
                Quản lý Hỗ trợ
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default App;
