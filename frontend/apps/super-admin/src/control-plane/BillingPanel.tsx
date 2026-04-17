import type { FormEvent } from "react";
import type { InvoiceMetadata } from "../types";
import { billingLabel } from "../services/superAdminPortalService";
import {
  type DraftInvoiceFormErrors,
  type DraftInvoiceFormState,
  type ManualPaymentFormErrors,
  type ManualPaymentFormState,
} from "./panelTypes";
import { renderFieldError } from "./panelShared";

interface BillingPanelProps {
  invoices: InvoiceMetadata[];
  loading: boolean;
  page: number;
  total: number;
  totalPages: number;
  currency: (value: number) => string;
  dateTime: (value?: string) => string;
  toneClass: (value: string) => string;
  menuInvoiceId: string | null;
  paymentDialogInvoice: InvoiceMetadata | null;
  paymentForm: ManualPaymentFormState;
  paymentErrors: ManualPaymentFormErrors;
  draftEditorInvoice: InvoiceMetadata | null;
  draftForm: DraftInvoiceFormState;
  draftErrors: DraftInvoiceFormErrors;
  markingInvoiceId: string | null;
  remindingInvoiceId: string | null;
  downloadingInvoiceId: string | null;
  editingDraftInvoiceId: string | null;
  cancelingDraftInvoiceId: string | null;
  onToggleMenu: (invoiceId: string | null) => void;
  onOpenPaymentDialog: (invoice: InvoiceMetadata) => void;
  onClosePaymentDialog: () => void;
  onPaymentChange: <K extends keyof ManualPaymentFormState>(
    field: K,
    value: ManualPaymentFormState[K],
  ) => void;
  onSubmitPayment: (event: FormEvent<HTMLFormElement>) => void;
  onSendReminder: (invoice: InvoiceMetadata) => void;
  onDownloadPdf: (invoice: InvoiceMetadata) => void;
  onOpenDraftEditor: (invoice: InvoiceMetadata) => void;
  onCloseDraftEditor: () => void;
  onDraftChange: <K extends keyof DraftInvoiceFormState>(
    field: K,
    value: DraftInvoiceFormState[K],
  ) => void;
  onSubmitDraft: (event: FormEvent<HTMLFormElement>) => void;
  onCancelDraft: (invoice: InvoiceMetadata) => void;
  onPageChange: (page: number) => void;
}

interface BillingCardProps {
  invoice: InvoiceMetadata;
  currency: (value: number) => string;
  dateTime: (value?: string) => string;
  toneClass: (value: string) => string;
  menuOpen: boolean;
  markingInvoiceId: string | null;
  remindingInvoiceId: string | null;
  downloadingInvoiceId: string | null;
  editingDraftInvoiceId: string | null;
  cancelingDraftInvoiceId: string | null;
  onToggleMenu: () => void;
  onOpenPaymentDialog: () => void;
  onSendReminder: () => void;
  onDownloadPdf: () => void;
  onOpenDraftEditor: () => void;
  onCancelDraft: () => void;
}

interface ManualPaymentDialogProps {
  invoice: InvoiceMetadata;
  paymentForm: ManualPaymentFormState;
  paymentErrors: ManualPaymentFormErrors;
  onClose: () => void;
  onPaymentChange: <K extends keyof ManualPaymentFormState>(
    field: K,
    value: ManualPaymentFormState[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

interface DraftInvoiceDialogProps {
  invoice: InvoiceMetadata;
  draftForm: DraftInvoiceFormState;
  draftErrors: DraftInvoiceFormErrors;
  currency: (value: number) => string;
  onClose: () => void;
  onDraftChange: <K extends keyof DraftInvoiceFormState>(
    field: K,
    value: DraftInvoiceFormState[K],
  ) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

const canMarkAsPaid = (invoice: InvoiceMetadata) =>
  invoice.status === "upcoming" || invoice.status === "overdue";

const canSendReminder = (invoice: InvoiceMetadata) =>
  invoice.status === "upcoming" || invoice.status === "overdue";

const isDraft = (invoice: InvoiceMetadata) => invoice.status === "draft";

const renderBillingAutomationNote = (
  invoice: InvoiceMetadata,
  dateTime: (value?: string) => string,
) => {
  if (invoice.status === "draft") {
    return `Tự động sinh trước ${invoice.draftLeadDays} ngày để kế toán thêm giảm giá hoặc phí user phát sinh trước khi chốt.`;
  }

  if (invoice.status === "upcoming") {
    return `Hóa đơn đã chốt và gửi email tự động cho Tenant Owner lúc ${dateTime(
      invoice.emailSentAt,
    )}.`;
  }

  if (invoice.status === "paid") {
    return `Đã thanh toán lúc ${dateTime(invoice.paidAt)}${
      invoice.paymentGatewayRef ? ` • Mã giao dịch ${invoice.paymentGatewayRef}` : ""
    }.`;
  }

  const graceEndsAt = invoice.graceEndsAt ? Date.parse(invoice.graceEndsAt) : Number.NaN;
  if (!Number.isNaN(graceEndsAt) && graceEndsAt > Date.now()) {
    const daysLeft = Math.max(
      0,
      Math.ceil((graceEndsAt - Date.now()) / (24 * 60 * 60 * 1000)),
    );

    return `Đã gửi cảnh báo quá hạn. Còn ${daysLeft} ngày ân hạn trước khi tenant bị tự động tạm dừng.`;
  }

  return "Đã vượt thời gian ân hạn. Tenant tương ứng sẽ bị chuyển sang trạng thái tạm dừng / bị khóa đăng nhập.";
};

function BillingCard({
  invoice,
  currency,
  dateTime,
  toneClass,
  menuOpen,
  markingInvoiceId,
  remindingInvoiceId,
  downloadingInvoiceId,
  editingDraftInvoiceId,
  cancelingDraftInvoiceId,
  onToggleMenu,
  onOpenPaymentDialog,
  onSendReminder,
  onDownloadPdf,
  onOpenDraftEditor,
  onCancelDraft,
}: BillingCardProps) {
  return (
    <article className="plan-card">
      <div className="sa-plan-card-head">
        <div style={{ display: "grid", gap: 12 }}>
          <div className={`sa-pill ${toneClass(invoice.status)}`}>
            {billingLabel(invoice.status)}
          </div>
          <div>
            <h2 className="sa-plan-card-title">{invoice.invoiceCode}</h2>
            <p style={{ color: "var(--sa-text-muted)" }}>
              {invoice.companyName} • {invoice.workspaceCode}
            </p>
          </div>
        </div>

        <div className="sa-plan-card-actions">
          <span className="price-chip">{currency(invoice.amountVnd)}</span>
          <div className="sa-card-menu">
            <button
              type="button"
              className="ghost-icon-button"
              aria-label={`Mở menu cho hóa đơn ${invoice.invoiceCode}`}
              onClick={onToggleMenu}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>

            {menuOpen ? (
              <div className="sa-card-menu-panel" role="menu">
                {canMarkAsPaid(invoice) ? (
                  <button type="button" role="menuitem" onClick={onOpenPaymentDialog}>
                    Xác nhận thanh toán
                  </button>
                ) : null}
                {canSendReminder(invoice) ? (
                  <button type="button" role="menuitem" onClick={onSendReminder}>
                    Gửi nhắc nợ
                  </button>
                ) : null}
                <button type="button" role="menuitem" onClick={onDownloadPdf}>
                  Xuất PDF
                </button>
                {isDraft(invoice) ? (
                  <>
                    <button type="button" role="menuitem" onClick={onOpenDraftEditor}>
                      Chỉnh sửa
                    </button>
                    <button type="button" role="menuitem" className="is-danger" onClick={onCancelDraft}>
                      Hủy bản nháp
                    </button>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="sa-meta-grid" style={{ marginTop: 16 }}>
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
          <strong>{invoice.paymentGatewayRef ?? "Chưa có"}</strong>
        </div>
      </div>

      <p className="sa-plan-card-copy" style={{ marginTop: 16 }}>
        {invoice.summaryNote}
      </p>

      <div className="sa-chip-row">
        <span className="sa-pill is-slate">Draft lead {invoice.draftLeadDays} ngày</span>
        <span className="sa-pill is-slate">Grace {invoice.gracePeriodDays} ngày</span>
        {invoice.reminderSentAt ? (
          <span className="sa-pill is-sky">Nhắc nợ {dateTime(invoice.reminderSentAt)}</span>
        ) : null}
      </div>

      <p className="sa-billing-note">{renderBillingAutomationNote(invoice, dateTime)}</p>

      {(markingInvoiceId === invoice.id ||
        remindingInvoiceId === invoice.id ||
        downloadingInvoiceId === invoice.id ||
        editingDraftInvoiceId === invoice.id ||
        cancelingDraftInvoiceId === invoice.id) ? (
        <div className="sa-chip-row">
          {markingInvoiceId === invoice.id ? (
            <span className="sa-pill is-sky">Đang xác nhận thanh toán...</span>
          ) : null}
          {remindingInvoiceId === invoice.id ? (
            <span className="sa-pill is-sky">Đang gửi nhắc nợ...</span>
          ) : null}
          {downloadingInvoiceId === invoice.id ? (
            <span className="sa-pill is-sky">Đang tạo PDF...</span>
          ) : null}
          {editingDraftInvoiceId === invoice.id ? (
            <span className="sa-pill is-sky">Đang lưu bản nháp...</span>
          ) : null}
          {cancelingDraftInvoiceId === invoice.id ? (
            <span className="sa-pill is-rose">Đang hủy bản nháp...</span>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function ManualPaymentDialog({
  invoice,
  paymentForm,
  paymentErrors,
  onClose,
  onPaymentChange,
  onSubmit,
}: ManualPaymentDialogProps) {
  return (
    <div className="sa-dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="sa-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Xác nhận thanh toán ${invoice.invoiceCode}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sa-dialog-header">
          <div>
            <p className="panel-kicker">Thanh toán thủ công</p>
            <h2 className="sa-dialog-title">Xác nhận {invoice.invoiceCode}</h2>
          </div>
          <button
            type="button"
            className="ghost-icon-button"
            onClick={onClose}
            aria-label="Đóng popup xác nhận thanh toán"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="sa-dialog-body">
          <div className="sa-form-grid">
            <label className="sa-form-field">
              <span>Mã giao dịch</span>
              <input
                value={paymentForm.paymentGatewayRef}
                onChange={(event) => onPaymentChange("paymentGatewayRef", event.target.value)}
                placeholder="Ví dụ: MB-2026-000182"
                required
              />
              {renderFieldError(paymentErrors.paymentGatewayRef)}
            </label>

            <label className="sa-form-field">
              <span>Ngày nhận tiền</span>
              <input
                type="datetime-local"
                value={paymentForm.receivedAt}
                onChange={(event) => onPaymentChange("receivedAt", event.target.value)}
                required
              />
              {renderFieldError(paymentErrors.receivedAt)}
            </label>
          </div>

          <div className="sa-dialog-copy">
            <p>
              Sau khi xác nhận, hệ thống sẽ chuyển hóa đơn sang trạng thái Đã thanh
              toán và tự động gia hạn chu kỳ tenant tương ứng.
            </p>
          </div>

          <div className="sa-dialog-actions">
            <button type="button" className="sa-secondary-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="primary-button">
              <span className="material-symbols-outlined">payments</span>
              Xác nhận thanh toán
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function DraftInvoiceDialog({
  invoice,
  draftForm,
  draftErrors,
  currency,
  onClose,
  onDraftChange,
  onSubmit,
}: DraftInvoiceDialogProps) {
  return (
    <div className="sa-dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="sa-dialog sa-dialog--wide"
        role="dialog"
        aria-modal="true"
        aria-label={`Chỉnh sửa hóa đơn nháp ${invoice.invoiceCode}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sa-dialog-header">
          <div>
            <p className="panel-kicker">Bản nháp hóa đơn</p>
            <h2 className="sa-dialog-title">Chỉnh sửa {invoice.invoiceCode}</h2>
          </div>
          <button
            type="button"
            className="ghost-icon-button"
            onClick={onClose}
            aria-label="Đóng form chỉnh sửa bản nháp"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="sa-dialog-body">
          <div className="sa-form-grid">
            <label className="sa-form-field">
              <span>Giảm giá (VND)</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={draftForm.discountVnd}
                onChange={(event) => onDraftChange("discountVnd", event.target.value)}
                required
              />
              {renderFieldError(draftErrors.discountVnd)}
            </label>

            <label className="sa-form-field">
              <span>Phí user phát sinh (VND)</span>
              <input
                type="number"
                min="0"
                step="1000"
                value={draftForm.additionalSeatFeeVnd}
                onChange={(event) =>
                  onDraftChange("additionalSeatFeeVnd", event.target.value)
                }
                required
              />
              {renderFieldError(draftErrors.additionalSeatFeeVnd)}
            </label>

            <label className="sa-form-field">
              <span>Hạn thanh toán</span>
              <input
                type="datetime-local"
                value={draftForm.dueAt}
                onChange={(event) => onDraftChange("dueAt", event.target.value)}
                required
              />
              {renderFieldError(draftErrors.dueAt)}
            </label>

            <div className="detail-card">
              <span>Tạm tính sau điều chỉnh</span>
              <strong>
                {currency(
                  Math.max(
                    0,
                    invoice.baseAmountVnd +
                      Number(draftForm.additionalSeatFeeVnd || 0) -
                      Number(draftForm.discountVnd || 0),
                  ),
                )}
              </strong>
            </div>

            <label className="sa-form-field sa-form-field-wide">
              <span>Ghi chú chi tiết gói cước</span>
              <textarea
                value={draftForm.summaryNote}
                onChange={(event) => onDraftChange("summaryNote", event.target.value)}
                rows={4}
                required
              />
              {renderFieldError(draftErrors.summaryNote)}
            </label>
          </div>

          <div className="sa-dialog-actions">
            <button type="button" className="sa-secondary-button" onClick={onClose}>
              Đóng
            </button>
            <button type="submit" className="primary-button">
              <span className="material-symbols-outlined">save</span>
              Lưu bản nháp
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function BillingPanel({
  invoices,
  loading,
  page,
  total,
  totalPages,
  currency,
  dateTime,
  toneClass,
  menuInvoiceId,
  paymentDialogInvoice,
  paymentForm,
  paymentErrors,
  draftEditorInvoice,
  draftForm,
  draftErrors,
  markingInvoiceId,
  remindingInvoiceId,
  downloadingInvoiceId,
  editingDraftInvoiceId,
  cancelingDraftInvoiceId,
  onToggleMenu,
  onOpenPaymentDialog,
  onClosePaymentDialog,
  onPaymentChange,
  onSubmitPayment,
  onSendReminder,
  onDownloadPdf,
  onOpenDraftEditor,
  onCloseDraftEditor,
  onDraftChange,
  onSubmitDraft,
  onCancelDraft,
  onPageChange,
}: BillingPanelProps) {
  return (
    <>
      {loading ? (
        <section className="support-card sa-empty-state">
          <span className="material-symbols-outlined">receipt_long</span>
          <p>Đang tải danh sách hóa đơn từ Control Plane...</p>
        </section>
      ) : invoices.length === 0 ? (
        <div className="support-card sa-empty-state">
          <span className="material-symbols-outlined">receipt_long</span>
          <p>Không có dữ liệu hóa đơn nào khớp với bộ lọc.</p>
        </div>
      ) : (
        <>
          <section className="sa-billing-grid">
            {invoices.map((invoice) => (
              <BillingCard
                key={invoice.id}
                invoice={invoice}
                currency={currency}
                dateTime={dateTime}
                toneClass={toneClass}
                menuOpen={menuInvoiceId === invoice.id}
                markingInvoiceId={markingInvoiceId}
                remindingInvoiceId={remindingInvoiceId}
                downloadingInvoiceId={downloadingInvoiceId}
                editingDraftInvoiceId={editingDraftInvoiceId}
                cancelingDraftInvoiceId={cancelingDraftInvoiceId}
                onToggleMenu={() => onToggleMenu(menuInvoiceId === invoice.id ? null : invoice.id)}
                onOpenPaymentDialog={() => {
                  onToggleMenu(null);
                  onOpenPaymentDialog(invoice);
                }}
                onSendReminder={() => {
                  onToggleMenu(null);
                  onSendReminder(invoice);
                }}
                onDownloadPdf={() => {
                  onToggleMenu(null);
                  onDownloadPdf(invoice);
                }}
                onOpenDraftEditor={() => {
                  onToggleMenu(null);
                  onOpenDraftEditor(invoice);
                }}
                onCancelDraft={() => {
                  onToggleMenu(null);
                  onCancelDraft(invoice);
                }}
              />
            ))}
          </section>

          <div className="sa-pagination">
            <p>
              Trang {page} / {totalPages} • {total} hóa đơn
            </p>
            <div className="sa-pagination-actions">
              <button
                type="button"
                className="sa-secondary-button"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                Trang trước
              </button>
              <button
                type="button"
                className="sa-secondary-button"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                Trang sau
              </button>
            </div>
          </div>
        </>
      )}

      {paymentDialogInvoice ? (
        <ManualPaymentDialog
          invoice={paymentDialogInvoice}
          paymentForm={paymentForm}
          paymentErrors={paymentErrors}
          onClose={onClosePaymentDialog}
          onPaymentChange={onPaymentChange}
          onSubmit={onSubmitPayment}
        />
      ) : null}

      {draftEditorInvoice ? (
        <DraftInvoiceDialog
          invoice={draftEditorInvoice}
          draftForm={draftForm}
          draftErrors={draftErrors}
          currency={currency}
          onClose={onCloseDraftEditor}
          onDraftChange={onDraftChange}
          onSubmit={onSubmitDraft}
        />
      ) : null}
    </>
  );
}
