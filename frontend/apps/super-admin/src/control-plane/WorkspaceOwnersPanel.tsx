import type { FormEvent } from "react";
import type { TenantSubscription } from "../types";
import {
  ownerStatusLabel,
  type WorkspaceOwnerCreateInput,
  type WorkspaceOwnerProvisioning,
  type WorkspaceOwnerProvisioningStatus,
} from "../services/superAdminPortalService";

interface WorkspaceOwnersPanelProps {
  plans: Array<{ code: string; name: string; monthlyPriceVnd: number }>;
  owners: WorkspaceOwnerProvisioning[];
  form: WorkspaceOwnerCreateInput;
  saving: boolean;
  currency: (value: number) => string;
  dateTime: (value?: string) => string;
  toneClass: (value: string) => string;
  onChange: <K extends keyof WorkspaceOwnerCreateInput>(
    field: K,
    value: WorkspaceOwnerCreateInput[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onCopy: (owner: WorkspaceOwnerProvisioning) => void;
  onResend: (ownerId: string) => void;
  onRevoke: (ownerId: string) => void;
  onFilter: (status: WorkspaceOwnerProvisioningStatus | "all") => void;
  filter: WorkspaceOwnerProvisioningStatus | "all";
}

export function WorkspaceOwnersPanel({
  plans,
  owners,
  form,
  saving,
  currency,
  dateTime,
  toneClass,
  onChange,
  onSubmit,
  onCopy,
  onResend,
  onRevoke,
}: WorkspaceOwnersPanelProps) {
  return (
    <section style={{ display: "grid", gap: 18 }}>
      <article className="support-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
          <div>
            <p className="panel-kicker">Onboarding (Chỉ mời)</p>
            <h2 style={{ color: "var(--sa-text-main)", fontSize: 24 }}>Tạo chủ sở hữu Workspace</h2>
          </div>
          <span className={`sa-pill ${toneClass("invited")}`}>Không đăng ký công khai</span>
        </div>

        <form onSubmit={onSubmit} style={{ display: "grid", gap: 14 }}>
          <div className="sa-form-grid">
            <label className="sa-form-field">
              <span>Tên công ty</span>
              <input
                value={form.companyName}
                onChange={(event) => onChange("companyName", event.target.value)}
                placeholder="Ví dụ: Công ty TNHH ABC"
                required
              />
            </label>
            <label className="sa-form-field">
              <span>Mã Workspace</span>
              <input
                value={form.workspaceCode}
                onChange={(event) =>
                  onChange("workspaceCode", event.target.value.replace(/\s+/g, "").toUpperCase())
                }
                placeholder="Vidu: ABCCO"
                required
              />
            </label>
            <label className="sa-form-field">
              <span>Họ tên chủ sở hữu</span>
              <input
                value={form.ownerFullName}
                onChange={(event) => onChange("ownerFullName", event.target.value)}
                placeholder="Nguyễn Văn A"
                required
              />
            </label>
            <label className="sa-form-field">
              <span>Email chủ sở hữu</span>
              <input
                type="email"
                value={form.ownerEmail}
                onChange={(event) => onChange("ownerEmail", event.target.value)}
                placeholder="owner@company.com"
                required
              />
            </label>
            <label className="sa-form-field">
              <span>Số điện thoại</span>
              <input
                value={form.ownerPhone}
                onChange={(event) => onChange("ownerPhone", event.target.value)}
                placeholder="09xxx"
              />
            </label>
            <label className="sa-form-field">
              <span>Chu kỳ thanh toán</span>
              <select
                value={form.billingCycle}
                onChange={(event) =>
                  onChange(
                    "billingCycle",
                    event.target.value as TenantSubscription["billingCycle"],
                  )
                }
              >
                <option value="monthly">Hàng tháng</option>
                <option value="quarterly">Hàng quý</option>
                <option value="yearly">Hàng năm</option>
              </select>
            </label>
            <label className="sa-form-field sa-form-field-wide">
              <span>Gói dịch vụ đăng ký</span>
              <select
                value={form.planCode}
                onChange={(event) => onChange("planCode", event.target.value)}
              >
                {plans.map((plan) => (
                  <option key={plan.code} value={plan.code}>
                    {plan.name} • {currency(plan.monthlyPriceVnd)}
                  </option>
                ))}
              </select>
            </label>
            <label className="sa-form-field sa-form-field-wide">
              <span>Ghi chú nội bộ</span>
              <textarea
                value={form.note}
                onChange={(event) => onChange("note", event.target.value)}
                rows={4}
                placeholder="Thông tin hợp đồng, đặc thù onboarding hoặc chỉ dẫn riêng cho chủ sở hữu."
              />
            </label>
          </div>

          <div className="sa-callout">
            <span className="material-symbols-outlined">policy</span>
            <div>
              <strong>Ranh giới bảo mật</strong>
              <p>
                SuperAdmin chỉ tạo lời mời. Chủ sở hữu Workspace sẽ tự thiết lập mật khẩu sau đó thông qua liên kết kích hoạt trong Email.
              </p>
            </div>
          </div>

          <button type="submit" className="primary-button" disabled={saving}>
            <span className="material-symbols-outlined">person_add</span>
            {saving ? "Đang tạo lời mời..." : "Tạo lời mời kích hoạt"}
          </button>
        </form>
      </article>

      <article className="support-card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 16, marginBottom: 18 }}>
          <div>
            <p className="panel-kicker">Hàng chờ kích hoạt</p>
            <h2 style={{ color: "var(--sa-text-main)", fontSize: 24 }}>Danh sách lời mời</h2>
          </div>
          <span className="sa-pill is-slate">{owners.length} bản ghi</span>
        </div>

        <div style={{ display: "grid", gap: 14 }}>
          {owners.length === 0 ? (
            <div className="sa-empty-state">
              <span className="material-symbols-outlined">inbox</span>
              <p>Không có lời mời nào khớp với bộ lọc hiện tại.</p>
            </div>
          ) : (
            owners.map((owner) => (
              <article key={owner.id} className="sa-record-card">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                  <div>
                    <div className={`sa-pill ${toneClass(owner.status)}`}>
                      {ownerStatusLabel(owner.status)}
                    </div>
                    <h3 style={{ color: "var(--sa-text-main)", marginTop: 12, marginBottom: 6 }}>
                      {owner.companyName}
                    </h3>
                    <p style={{ color: "var(--sa-text-muted)" }}>
                      {owner.workspaceCode} • {owner.ownerEmail}
                    </p>
                  </div>
                  <span className="sa-pill is-slate">{owner.planName}</span>
                </div>

                <div className="sa-meta-grid" style={{ marginTop: 16 }}>
                  <div className="detail-card">
                    <span>Chủ sở hữu</span>
                    <strong>{owner.ownerFullName}</strong>
                  </div>
                  <div className="detail-card">
                    <span>Gửi lần cuối</span>
                    <strong>{dateTime(owner.lastSentAt)}</strong>
                  </div>
                  <div className="detail-card">
                    <span>Hết hạn</span>
                    <strong>{dateTime(owner.expiresAt)}</strong>
                  </div>
                  <div className="detail-card">
                    <span>Liên kết kích hoạt</span>
                    <strong className="sa-truncate">{owner.activationLink}</strong>
                  </div>
                </div>

                {owner.note ? (
                  <p style={{ color: "var(--sa-text-dim)", marginTop: 14, lineHeight: 1.7 }}>{owner.note}</p>
                ) : null}

                <div className="sa-inline-actions">
                  <button type="button" className="sa-secondary-button" onClick={() => onCopy(owner)}>
                    Sao chép link
                  </button>
                  <button
                    type="button"
                    className="sa-secondary-button"
                    onClick={() => onResend(owner.id)}
                    disabled={owner.status === "revoked"}
                  >
                    Gửi lại
                  </button>
                  <button
                    type="button"
                    className="sa-danger-button"
                    onClick={() => onRevoke(owner.id)}
                    disabled={owner.status === "revoked"}
                  >
                    Thu hồi
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </article>
    </section>
  );
}
