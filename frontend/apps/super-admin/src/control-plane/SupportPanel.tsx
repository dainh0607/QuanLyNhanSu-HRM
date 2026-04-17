import { useEffect, useState, type FormEvent } from "react";
import type { SupportGrant } from "../types";
import { supportLabel } from "../services/superAdminPortalService";
import {
  type SupportTicketFormErrors,
  type SupportTicketFormState,
} from "./panelTypes";
import { renderFieldError } from "./panelShared";

interface SupportTenantOption {
  id: string;
  companyName: string;
  workspaceCode: string;
}

interface SupportPanelProps {
  grants: SupportGrant[];
  tenants: SupportTenantOption[];
  loading: boolean;
  requestOpen: boolean;
  requestForm: SupportTicketFormState;
  requestErrors: SupportTicketFormErrors;
  creatingRequest: boolean;
  activatingTicketId: string | null;
  revokingTicketId: string | null;
  dateTime: (value?: string) => string;
  toneClass: (value: string) => string;
  onCloseRequest: () => void;
  onRequestChange: <K extends keyof SupportTicketFormState>(
    field: K,
    value: SupportTicketFormState[K],
  ) => void;
  onSubmitRequest: (event: FormEvent<HTMLFormElement>) => void;
  onActivate: (ticketId: string) => void;
  onRevoke: (ticketId: string) => void;
}

interface SupportTicketCardProps {
  grant: SupportGrant;
  dateTime: (value?: string) => string;
  toneClass: (value: string) => string;
  activatingTicketId: string | null;
  revokingTicketId: string | null;
  now: number;
  onActivate: () => void;
  onRevoke: () => void;
}

interface SupportRequestDialogProps {
  tenants: SupportTenantOption[];
  requestForm: SupportTicketFormState;
  requestErrors: SupportTicketFormErrors;
  creatingRequest: boolean;
  onClose: () => void;
  onRequestChange: <K extends keyof SupportTicketFormState>(
    field: K,
    value: SupportTicketFormState[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const formatDurationLabel = (hours?: number) => {
  const normalizedHours = Math.max(1, Number(hours || 1));
  return normalizedHours === 24 ? "24 giờ" : `${normalizedHours} giờ`;
};

const formatCountdown = (expiresAt: string | undefined, now: number) => {
  if (!expiresAt) {
    return "Chờ kích hoạt";
  }

  const remainingMs = Date.parse(expiresAt) - now;
  if (!Number.isFinite(remainingMs) || remainingMs <= 0) {
    return "Đã hết hạn";
  }

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(
    seconds,
  ).padStart(2, "0")}`;
};

const resolveRuntimeStatus = (grant: SupportGrant, now: number) =>
  grant.status === "granted" && grant.expiresAt && Date.parse(grant.expiresAt) <= now
    ? "expired"
    : grant.status;

function SupportTicketCard({
  grant,
  dateTime,
  toneClass,
  activatingTicketId,
  revokingTicketId,
  now,
  onActivate,
  onRevoke,
}: SupportTicketCardProps) {
  const runtimeStatus = resolveRuntimeStatus(grant, now);
  const canActivate =
    Boolean(grant.customerApprovedAt) &&
    runtimeStatus !== "granted" &&
    runtimeStatus !== "expired";
  const canRevoke = runtimeStatus === "granted";

  return (
    <article className="plan-card support-ticket-card">
      <div className="sa-plan-card-head">
        <div style={{ display: "grid", gap: 12 }}>
          <span className={`sa-pill ${toneClass(runtimeStatus)}`}>
            {supportLabel(runtimeStatus)}
          </span>
          <div>
            <h2 className="sa-plan-card-title">{grant.ticketId}</h2>
            <p style={{ color: "var(--sa-text-muted)" }}>
              {grant.companyName} • {grant.workspaceCode}
            </p>
          </div>
        </div>

        <span className={`sa-pill ${grant.customerApprovedAt ? "is-emerald" : "is-slate"}`}>
          {grant.customerApprovedAt ? "Khách hàng đã phê duyệt" : "Chờ phê duyệt"}
        </span>
      </div>

      <p className="sa-plan-card-copy">{grant.requestedScope}</p>

      <div className="sa-meta-grid" style={{ marginTop: 16 }}>
        <div className="detail-card">
          <span>Phê duyệt bởi</span>
          <strong>
            {grant.approvedByCustomerContact ??
              grant.tenantOwnerEmail ??
              "Chờ khách hàng xác nhận"}
          </strong>
        </div>
        <div className="detail-card">
          <span>Thời gian phê duyệt</span>
          <strong>{dateTime(grant.customerApprovedAt)}</strong>
        </div>
        <div className="detail-card">
          <span>Hết hạn quyền</span>
          <strong>
            {grant.expiresAt
              ? `${dateTime(grant.expiresAt)}${
                  runtimeStatus === "granted"
                    ? ` • ${formatCountdown(grant.expiresAt, now)}`
                    : ""
                }`
              : "Chưa có"}
          </strong>
        </div>
        <div className="detail-card">
          <span>Chính sách hỗ trợ</span>
          <strong>{grant.note}</strong>
        </div>
      </div>

      <div className="sa-chip-row">
        <span className="sa-pill is-slate">Yêu cầu lúc {dateTime(grant.requestedAt)}</span>
        <span className="sa-pill is-slate">
          Thời lượng {formatDurationLabel(grant.requestedDurationHours)}
        </span>
        {grant.lastNotifiedAt ? (
          <span className="sa-pill is-sky">Thông báo {dateTime(grant.lastNotifiedAt)}</span>
        ) : null}
      </div>

      <p className="sa-support-audit-note">
        Audit log bắt buộc: mọi thao tác thêm/sửa/xóa trong Workspace của khách hàng phải
        ghi với định danh{" "}
        <strong>{grant.auditActorLabel ?? "Hệ thống hỗ trợ - NexaHR Super Admin"}</strong>.
      </p>

      <div className="sa-inline-actions">
        <button
          type="button"
          className="sa-secondary-button"
          disabled={!canActivate || activatingTicketId === grant.ticketId}
          onClick={onActivate}
        >
          {activatingTicketId === grant.ticketId
            ? "Đang kích hoạt..."
            : "Kích hoạt phiên hỗ trợ"}
        </button>
        <button
          type="button"
          className="sa-danger-button"
          disabled={!canRevoke || revokingTicketId === grant.ticketId}
          onClick={onRevoke}
        >
          {revokingTicketId === grant.ticketId ? "Đang thu hồi..." : "Thu hồi"}
        </button>
      </div>
    </article>
  );
}

function SupportRequestDialog({
  tenants,
  requestForm,
  requestErrors,
  creatingRequest,
  onClose,
  onRequestChange,
  onSubmit,
}: SupportRequestDialogProps) {
  return (
    <div className="sa-dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="sa-dialog"
        role="dialog"
        aria-modal="true"
        aria-label="Tạo yêu cầu hỗ trợ mới"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sa-dialog-header">
          <div>
            <p className="panel-kicker">Support Ticket</p>
            <h2 className="sa-dialog-title">Tạo yêu cầu hỗ trợ</h2>
          </div>
          <button
            type="button"
            className="ghost-icon-button"
            onClick={onClose}
            aria-label="Đóng form tạo yêu cầu hỗ trợ"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="sa-dialog-body">
          <div className="sa-form-grid">
            <label className="sa-form-field">
              <span>Tenant / Workspace</span>
              <select
                value={requestForm.tenantId}
                onChange={(event) => onRequestChange("tenantId", event.target.value)}
                required
              >
                <option value="">Chọn Tenant cần xin quyền</option>
                {tenants.map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>
                    {tenant.companyName} • {tenant.workspaceCode}
                  </option>
                ))}
              </select>
              {renderFieldError(requestErrors.tenantId)}
            </label>

            <label className="sa-form-field">
              <span>Thời lượng xin quyền</span>
              <select
                value={requestForm.durationHours}
                onChange={(event) => onRequestChange("durationHours", event.target.value)}
                required
              >
                <option value="1">1 giờ</option>
                <option value="2">2 giờ</option>
                <option value="24">24 giờ</option>
              </select>
              <p className="sa-form-helper sa-form-helper--info">
                Thời gian hết hạn sẽ được tính từ lúc phiên hỗ trợ thật sự được kích hoạt.
              </p>
              {renderFieldError(requestErrors.durationHours)}
            </label>

            <label className="sa-form-field sa-form-field-wide">
              <span>Lý do xin quyền chi tiết</span>
              <textarea
                value={requestForm.requestedScope}
                onChange={(event) => onRequestChange("requestedScope", event.target.value)}
                rows={5}
                placeholder="Mô tả lỗi, dữ liệu cần kiểm tra và phạm vi thao tác dự kiến."
                required
              />
              <p className="sa-form-helper sa-form-helper--info">
                Sau khi gửi, hệ thống sẽ tạo ticket ở trạng thái Chờ khách hàng phê duyệt
                và bắn email/notification sang Tenant Owner.
              </p>
              {renderFieldError(requestErrors.requestedScope)}
            </label>
          </div>

          <div className="sa-dialog-copy">
            <p>
              Quyền truy cập hỗ trợ luôn bị khóa mặc định. Chỉ khi khách hàng phê duyệt
              và Super Admin kích hoạt phiên hỗ trợ, hệ thống mới sinh impersonation
              token tạm thời và bắt đầu đếm ngược thời gian hiệu lực.
            </p>
          </div>

          <div className="sa-dialog-actions">
            <button type="button" className="sa-secondary-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="primary-button" disabled={creatingRequest}>
              <span className="material-symbols-outlined">add</span>
              {creatingRequest ? "Đang gửi..." : "Gửi yêu cầu hỗ trợ"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function SupportPanel({
  grants,
  tenants,
  loading,
  requestOpen,
  requestForm,
  requestErrors,
  creatingRequest,
  activatingTicketId,
  revokingTicketId,
  dateTime,
  toneClass,
  onCloseRequest,
  onRequestChange,
  onSubmitRequest,
  onActivate,
  onRevoke,
}: SupportPanelProps) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <>
      {loading ? (
        <section className="support-card sa-empty-state">
          <span className="material-symbols-outlined">support_agent</span>
          <p>Đang tải danh sách Support Ticket từ Control Plane...</p>
        </section>
      ) : grants.length === 0 ? (
        <div className="support-card sa-empty-state">
          <span className="material-symbols-outlined">shield_lock</span>
          <p>Không có yêu cầu hỗ trợ nào khớp với bộ lọc hiện tại.</p>
        </div>
      ) : (
        <section className="support-grid">
          {grants.map((grant) => (
            <SupportTicketCard
              key={grant.ticketId}
              grant={grant}
              dateTime={dateTime}
              toneClass={toneClass}
              activatingTicketId={activatingTicketId}
              revokingTicketId={revokingTicketId}
              now={now}
              onActivate={() => onActivate(grant.ticketId)}
              onRevoke={() => onRevoke(grant.ticketId)}
            />
          ))}
        </section>
      )}

      {requestOpen ? (
        <SupportRequestDialog
          tenants={tenants}
          requestForm={requestForm}
          requestErrors={requestErrors}
          creatingRequest={creatingRequest}
          onClose={onCloseRequest}
          onRequestChange={onRequestChange}
          onSubmit={onSubmitRequest}
        />
      ) : null}
    </>
  );
}
