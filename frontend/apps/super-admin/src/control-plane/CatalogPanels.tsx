import type { InvoiceMetadata, SubscriptionPlan, SupportGrant } from "../types";
import { billingLabel, supportLabel } from "../services/superAdminPortalService";

interface PlansPanelProps {
  plans: SubscriptionPlan[];
  currency: (value: number) => string;
}

export function PlansPanel({ plans, currency }: PlansPanelProps) {
  return (
    <section className="plan-grid">
      {plans.map((plan) => (
        <article key={plan.id} className="plan-card">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
            <div>
              <p className="panel-kicker">{plan.code}</p>
              <h2 style={{ color: "var(--sa-text-main)", fontSize: 24 }}>{plan.name}</h2>
            </div>
            <span className="price-chip">{currency(plan.monthlyPriceVnd)}</span>
          </div>
          <p style={{ color: "var(--sa-text-dim)", lineHeight: 1.7 }}>{plan.description}</p>
          <div className="sa-meta-grid" style={{ marginTop: 16 }}>
            <div className="detail-card">
              <span>Lưu trữ</span>
              <strong>{plan.storageLimitGb} GB</strong>
            </div>
            <div className="detail-card">
              <span>Quản trị viên</span>
              <strong>{plan.adminSeatLimit}</strong>
            </div>
            <div className="detail-card">
              <span>Nhân viên tối đa</span>
              <strong>{plan.employeeSeatLimit}</strong>
            </div>
            <div className="detail-card">
              <span>Cam kết SLA</span>
              <strong>{plan.supportSla}</strong>
            </div>
          </div>
          <div className="sa-chip-row">
            {plan.modules.map((module) => (
              <span key={module} className="sa-pill is-slate">
                {module}
              </span>
            ))}
          </div>
        </article>
      ))}
    </section>
  );
}

interface BillingPanelProps {
  invoices: InvoiceMetadata[];
  currency: (value: number) => string;
  dateTime: (value?: string) => string;
  toneClass: (value: string) => string;
}

export function BillingPanel({
  invoices,
  currency,
  dateTime,
  toneClass,
}: BillingPanelProps) {
  return (
    <section className="support-list">
      {invoices.length === 0 ? (
        <div className="support-card sa-empty-state">
          <span className="material-symbols-outlined">receipt_long</span>
          <p>Không có dữ liệu hóa đơn nào khớp với bộ lọc.</p>
        </div>
      ) : (
        invoices.map((invoice) => (
          <article key={invoice.id} className="support-card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
              <div>
                <div className={`sa-pill ${toneClass(invoice.status)}`}>{billingLabel(invoice.status)}</div>
                <h2 style={{ color: "var(--sa-text-main)", fontSize: 24, marginTop: 12 }}>
                  {invoice.invoiceCode}
                </h2>
                <p style={{ color: "var(--sa-text-muted)" }}>
                  {invoice.companyName} • {invoice.workspaceCode}
                </p>
              </div>
              <span className="price-chip">{currency(invoice.amountVnd)}</span>
            </div>
            <div className="sa-meta-grid">
              <div className="detail-card">
                <span>Kỳ thanh toán</span>
                <strong>{invoice.billingPeriodLabel}</strong>
              </div>
              <div className="detail-card">
                <span>Ngày phát hành</span>
                <strong>{dateTime(invoice.issuedAt)}</strong>
              </div>
              <div className="detail-card">
                <span>Hạn thanh toán</span>
                <strong>{dateTime(invoice.dueAt)}</strong>
              </div>
              <div className="detail-card">
                <span>Mã giao dịch</span>
                <strong>{invoice.paymentGatewayRef}</strong>
              </div>
            </div>
            <p style={{ color: "var(--sa-text-dim)", lineHeight: 1.7, marginTop: 16 }}>
              {invoice.summaryNote}
            </p>
          </article>
        ))
      )}
    </section>
  );
}

interface SupportPanelProps {
  grants: SupportGrant[];
  dateTime: (value?: string) => string;
  toneClass: (value: string) => string;
  onActivate: (ticketId: string) => void;
  onRevoke: (ticketId: string) => void;
}

export function SupportPanel({
  grants,
  dateTime,
  toneClass,
  onActivate,
  onRevoke,
}: SupportPanelProps) {
  return (
    <section className="support-list">
      {grants.length === 0 ? (
        <div className="support-card sa-empty-state">
          <span className="material-symbols-outlined">shield_lock</span>
          <p>Không có quyền hỗ trợ nào khớp với bộ lọc.</p>
        </div>
      ) : (
        grants.map((grant) => (
          <article key={grant.ticketId} className="support-card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
              <div>
                <div className={`sa-pill ${toneClass(grant.status)}`}>{supportLabel(grant.status)}</div>
                <h2 style={{ color: "var(--sa-text-main)", fontSize: 24, marginTop: 12 }}>
                  {grant.ticketId}
                </h2>
                <p style={{ color: "var(--sa-text-muted)" }}>
                  {grant.companyName} • {grant.workspaceCode}
                </p>
              </div>
              <span className="sa-pill is-slate">
                {grant.customerApprovedAt ? "Khách hàng đã phê duyệt" : "Chờ phê duyệt"}
              </span>
            </div>
            <p style={{ color: "var(--sa-text-dim)", lineHeight: 1.7 }}>{grant.requestedScope}</p>
            <div className="sa-meta-grid" style={{ marginTop: 16 }}>
              <div className="detail-card">
                <span>Phê duyệt bởi</span>
                <strong>{grant.approvedByCustomerContact ?? "Chưa phê duyệt"}</strong>
              </div>
              <div className="detail-card">
                <span>Thời gian phê duyệt</span>
                <strong>{dateTime(grant.customerApprovedAt)}</strong>
              </div>
              <div className="detail-card">
                <span>Hết hạn quyền</span>
                <strong>{dateTime(grant.expiresAt)}</strong>
              </div>
              <div className="detail-card">
                <span>Chính sách hỗ trợ</span>
                <strong>{grant.note}</strong>
              </div>
            </div>
            <div className="sa-inline-actions">
              <button type="button" className="sa-secondary-button" onClick={() => onActivate(grant.ticketId)}>
                Kích hoạt phiên hỗ trợ
              </button>
              <button type="button" className="sa-danger-button" onClick={() => onRevoke(grant.ticketId)}>
                Thu hồi
              </button>
            </div>
          </article>
        ))
      )}
    </section>
  );
}
