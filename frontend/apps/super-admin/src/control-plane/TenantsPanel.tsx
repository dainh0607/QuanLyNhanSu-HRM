import type { TenantSubscription } from "../types";
import { onboardingLabel, subscriptionLabel, supportLabel } from "../services/superAdminPortalService";

interface TenantsPanelProps {
  tenants: TenantSubscription[];
  selectedTenant: TenantSubscription | null;
  dateTime: (value?: string) => string;
  toneClass: (value: string) => string;
  usagePercent: (tenant: TenantSubscription) => number;
  onSelect: (workspaceCode: string) => void;
}

export function TenantsPanel({
  tenants,
  selectedTenant,
  dateTime,
  toneClass,
  usagePercent,
  onSelect,
}: TenantsPanelProps) {
  return (
    <section className="sa-split-layout">
      <article className="support-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
          <div>
            <p className="panel-kicker">Danh bạ Tenant</p>
            <h2 style={{ color: "var(--sa-text-main)", fontSize: 24 }}>Metadata Workspace</h2>
          </div>
          <span className="sa-pill is-slate">{tenants.length} tenants</span>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {tenants.map((tenant) => (
            <button
              key={tenant.id}
              type="button"
              className={`sa-record-card sa-tenant-card ${
                selectedTenant?.workspaceCode === tenant.workspaceCode ? "is-active" : ""
              }`}
              onClick={() => onSelect(tenant.workspaceCode)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                <div>
                  <div className={`sa-pill ${toneClass(tenant.subscriptionStatus)}`}>
                    {subscriptionLabel(tenant.subscriptionStatus)}
                  </div>
                  <h3 style={{ color: "var(--sa-text-main)", marginTop: 12, marginBottom: 6 }}>
                    {tenant.companyName}
                  </h3>
                  <p style={{ color: "var(--sa-text-muted)" }}>
                    {tenant.workspaceCode} • {tenant.portalAdminEmail}
                  </p>
                </div>
                <span className="sa-pill is-slate">{tenant.planName}</span>
              </div>
              <div className="sa-metric-row">
                <span>{tenant.activeEmployees} nhân viên</span>
                <span>{usagePercent(tenant)}% bộ nhớ</span>
                <span>{supportLabel(tenant.supportAccessStatus)}</span>
              </div>
            </button>
          ))}
        </div>
      </article>

      <article className="support-card">
        {selectedTenant ? (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
              <div>
                <p className="panel-kicker">Tenant đang chọn</p>
                <h2 style={{ color: "var(--sa-text-main)", fontSize: 24 }}>{selectedTenant.companyName}</h2>
              </div>
              <span className={`sa-pill ${toneClass(selectedTenant.supportAccessStatus)}`}>
                {supportLabel(selectedTenant.supportAccessStatus)}
              </span>
            </div>

            <div className="sa-meta-grid">
              <div className="detail-card">
                <span>Workspace</span>
                <strong>{selectedTenant.workspaceCode}</strong>
              </div>
              <div className="detail-card">
                <span>Gói dịch vụ</span>
                <strong>{selectedTenant.planName}</strong>
              </div>
              <div className="detail-card">
                <span>Onboarding</span>
                <strong>{onboardingLabel(selectedTenant.onboardingStatus)}</strong>
              </div>
              <div className="detail-card">
                <span>Gia hạn</span>
                <strong>{dateTime(selectedTenant.nextRenewalAt)}</strong>
              </div>
              <div className="detail-card">
                <span>Dung lượng Quota</span>
                <strong>
                  {selectedTenant.storageUsedGb} / {selectedTenant.storageLimitGb} GB
                </strong>
              </div>
              <div className="detail-card">
                <span>Hóa đơn cuối</span>
                <strong>{selectedTenant.lastInvoiceCode}</strong>
              </div>
            </div>

            <div className="sa-usage-panel">
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                <strong style={{ color: "var(--sa-text-main)" }}>Mức độ sử dụng Quota</strong>
                <span style={{ color: "var(--sa-text-dim)" }}>{usagePercent(selectedTenant)}%</span>
              </div>
              <div className="sa-usage-track">
                <div
                  className={`sa-usage-fill ${toneClass(
                    usagePercent(selectedTenant) >= 85 ? "overdue" : "active",
                  )}`}
                  style={{ width: `${usagePercent(selectedTenant)}%` }}
                />
              </div>
              <p style={{ color: "var(--sa-text-dim)", lineHeight: 1.7 }}>
                Quyền truy cập hỗ trợ bị khóa theo mặc định. Mọi thao tác xử lý sự cố tại Tenant đều yêu cầu Ticket hỗ trợ đã được khách hàng phê duyệt.
              </p>
            </div>
          </>
        ) : (
          <div className="sa-empty-state">
            <span className="material-symbols-outlined">domain_disabled</span>
            <p>Không có Tenant nào khớp với bộ lọc hiện tại.</p>
          </div>
        )}
      </article>
    </section>
  );
}
