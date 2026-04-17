import type { FormEvent } from "react";
import type { SubscriptionPlan, SubscriptionPlanStatus } from "../types";
import { planStatusLabel } from "../services/superAdminPortalService";
import {
  type SubscriptionPlanFormErrors,
  type SubscriptionPlanFormState,
} from "./panelTypes";
import { renderFieldError } from "./panelShared";

interface PlansPanelProps {
  plans: SubscriptionPlan[];
  loading: boolean;
  currency: (value: number) => string;
  form: SubscriptionPlanFormState;
  errors: SubscriptionPlanFormErrors;
  featureOptions: string[];
  editorMode: "create" | "edit";
  editorOpen: boolean;
  saving: boolean;
  menuPlanId: string | null;
  pendingDeletePlan: SubscriptionPlan | null;
  deletingPlanId: string | null;
  tenantUsageCount: (plan: SubscriptionPlan) => number;
  onToggleMenu: (planId: string | null) => void;
  onOpenEdit: (plan: SubscriptionPlan) => void;
  onCloseEditor: () => void;
  onChange: <K extends keyof SubscriptionPlanFormState>(
    field: K,
    value: SubscriptionPlanFormState[K],
  ) => void;
  onToggleFeature: (feature: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onRequestDelete: (plan: SubscriptionPlan) => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  usageCount: number;
  currency: (value: number) => string;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

interface PlanEditorDialogProps {
  form: SubscriptionPlanFormState;
  errors: SubscriptionPlanFormErrors;
  featureOptions: string[];
  editorMode: "create" | "edit";
  saving: boolean;
  currency: (value: number) => string;
  onClose: () => void;
  onChange: <K extends keyof SubscriptionPlanFormState>(
    field: K,
    value: SubscriptionPlanFormState[K],
  ) => void;
  onToggleFeature: (feature: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

interface PlanDeleteDialogProps {
  plan: SubscriptionPlan;
  deletingPlanId: string | null;
  tenantUsageCount: (plan: SubscriptionPlan) => number;
  onCancel: () => void;
  onConfirm: () => void;
}

const planToneClass = (status: SubscriptionPlanStatus) =>
  status === "active" ? "is-emerald" : "is-slate";

function PlanCard({
  plan,
  usageCount,
  currency,
  menuOpen,
  onToggleMenu,
  onEdit,
  onDelete,
}: PlanCardProps) {
  return (
    <article className="plan-card">
      <div className="sa-plan-card-head">
        <div style={{ display: "grid", gap: 12 }}>
          <div className="sa-chip-row" style={{ marginTop: 0 }}>
            <span className={`sa-pill ${planToneClass(plan.status)}`}>
              {planStatusLabel(plan.status)}
            </span>
            <span className="sa-pill is-slate">{plan.code}</span>
          </div>
          <div>
            <p className="panel-kicker">Catalog cấu hình</p>
            <h2 className="sa-plan-card-title">{plan.name}</h2>
          </div>
        </div>

        <div className="sa-plan-card-actions">
          <span className="price-chip">{currency(plan.monthlyPriceVnd)}</span>
          <div className="sa-card-menu">
            <button
              type="button"
              className="ghost-icon-button"
              aria-label={`Mở menu cho gói ${plan.code}`}
              onClick={onToggleMenu}
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>

            {menuOpen ? (
              <div className="sa-card-menu-panel" role="menu">
                <button type="button" role="menuitem" onClick={onEdit}>
                  Chỉnh sửa
                </button>
                <button type="button" role="menuitem" className="is-danger" onClick={onDelete}>
                  Xóa
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <p className="sa-plan-card-copy">{plan.description}</p>

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

      <div className="sa-chip-row">
        <span className="sa-pill is-slate">{usageCount} tenant đang dùng</span>
        {plan.status === "hidden" ? (
          <span className="sa-pill is-rose">Ẩn khỏi form onboarding</span>
        ) : (
          <span className="sa-pill is-sky">Sẵn sàng cho khách mới</span>
        )}
      </div>
    </article>
  );
}

function PlanEditorDialog({
  form,
  errors,
  featureOptions,
  editorMode,
  saving,
  currency,
  onClose,
  onChange,
  onToggleFeature,
  onSubmit,
}: PlanEditorDialogProps) {
  return (
    <div className="sa-dialog-backdrop" role="presentation" onClick={onClose}>
      <section
        className="sa-dialog sa-dialog--wide"
        role="dialog"
        aria-modal="true"
        aria-label={
          editorMode === "create"
            ? "Cấu hình gói dịch vụ mới"
            : "Cập nhật gói dịch vụ"
        }
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sa-dialog-header">
          <div>
            <p className="panel-kicker">
              {editorMode === "create" ? "Tạo gói mới" : "Chỉnh sửa gói"}
            </p>
            <h2 className="sa-dialog-title">Cấu hình gói dịch vụ</h2>
          </div>
          <button
            type="button"
            className="ghost-icon-button"
            onClick={onClose}
            aria-label="Đóng form cấu hình gói"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={onSubmit} className="sa-dialog-body">
          <section className="sa-plan-section">
            <div className="sa-plan-section-heading">
              <h3>Thông tin chung</h3>
              <p>Quản lý tên gói, badge hiển thị, giá bán và mô tả ngắn.</p>
            </div>

            <div className="sa-form-grid">
              <label className="sa-form-field">
                <span>Mã gói / Badge</span>
                <input
                  value={form.code}
                  onChange={(event) =>
                    onChange("code", event.target.value.replace(/\s+/g, "-").toUpperCase())
                  }
                  placeholder="Ví dụ: GROWTH"
                  maxLength={24}
                  required
                />
                <p className="sa-form-helper sa-form-helper--info">
                  Badge này sẽ xuất hiện ở card gói và form onboarding.
                </p>
                {renderFieldError(errors.code)}
              </label>

              <label className="sa-form-field">
                <span>Tên gói</span>
                <input
                  value={form.name}
                  onChange={(event) => onChange("name", event.target.value)}
                  placeholder="Ví dụ: Growth"
                  required
                />
                {renderFieldError(errors.name)}
              </label>

              <label className="sa-form-field">
                <span>Mức giá (VND / tháng)</span>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  value={form.monthlyPriceVnd}
                  onChange={(event) => onChange("monthlyPriceVnd", event.target.value)}
                  placeholder="8900000"
                  required
                />
                <p className="sa-form-helper sa-form-helper--info">
                  {currency(Number(form.monthlyPriceVnd || 0))}
                </p>
                {renderFieldError(errors.monthlyPriceVnd)}
              </label>

              <div className="sa-form-field">
                <span>Trạng thái</span>
                <div className="sa-toggle-group">
                  <button
                    type="button"
                    className={`sa-toggle-button ${form.status === "active" ? "is-active" : ""}`}
                    onClick={() => onChange("status", "active")}
                  >
                    Hoạt động
                  </button>
                  <button
                    type="button"
                    className={`sa-toggle-button ${
                      form.status === "hidden" ? "is-active is-hidden" : ""
                    }`}
                    onClick={() => onChange("status", "hidden")}
                  >
                    Ẩn
                  </button>
                </div>
                <p className="sa-form-helper sa-form-helper--info">
                  Gói Ẩn sẽ không còn xuất hiện ở form tạo Workspace Owner mới.
                </p>
              </div>

              <label className="sa-form-field sa-form-field-wide">
                <span>Mô tả ngắn</span>
                <textarea
                  value={form.description}
                  onChange={(event) => onChange("description", event.target.value)}
                  rows={4}
                  placeholder="Mô tả ngắn gọn về đối tượng phù hợp với gói này."
                  required
                />
                {renderFieldError(errors.description)}
              </label>
            </div>
          </section>

          <section className="sa-plan-section">
            <div className="sa-plan-section-heading">
              <h3>Giới hạn tài nguyên</h3>
              <p>Thiết lập quota lưu trữ, số quản trị viên, nhân viên và SLA.</p>
            </div>

            <div className="sa-form-grid">
              <label className="sa-form-field">
                <span>Dung lượng lưu trữ (GB)</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.storageLimitGb}
                  onChange={(event) => onChange("storageLimitGb", event.target.value)}
                  required
                />
                {renderFieldError(errors.storageLimitGb)}
              </label>

              <label className="sa-form-field">
                <span>Số Quản trị viên tối đa</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.adminSeatLimit}
                  onChange={(event) => onChange("adminSeatLimit", event.target.value)}
                  required
                />
                {renderFieldError(errors.adminSeatLimit)}
              </label>

              <label className="sa-form-field">
                <span>Số Nhân viên tối đa</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.employeeSeatLimit}
                  onChange={(event) => onChange("employeeSeatLimit", event.target.value)}
                  required
                />
                {renderFieldError(errors.employeeSeatLimit)}
              </label>

              <label className="sa-form-field">
                <span>Cam kết SLA</span>
                <input
                  value={form.supportSla}
                  onChange={(event) => onChange("supportSla", event.target.value)}
                  placeholder="Ví dụ: 8x5, phản hồi trong 4 giờ làm việc"
                  required
                />
                {renderFieldError(errors.supportSla)}
              </label>
            </div>
          </section>

          <section className="sa-plan-section">
            <div className="sa-plan-section-heading">
              <h3>Cấu hình tính năng</h3>
              <p>Chọn các phân hệ mà tenant của gói này được phép truy cập.</p>
            </div>

            <div className="sa-feature-grid">
              {featureOptions.map((feature) => {
                const checked = form.modules.includes(feature);

                return (
                  <label
                    key={feature}
                    className={`sa-feature-option ${checked ? "is-checked" : ""}`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleFeature(feature)}
                    />
                    <span>{feature}</span>
                  </label>
                );
              })}
            </div>
            {renderFieldError(errors.modules)}
          </section>

          <div className="sa-dialog-actions">
            <button type="button" className="sa-secondary-button" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              <span className="material-symbols-outlined">save</span>
              {saving ? "Đang lưu..." : "Lưu cấu hình"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

function PlanDeleteDialog({
  plan,
  deletingPlanId,
  tenantUsageCount,
  onCancel,
  onConfirm,
}: PlanDeleteDialogProps) {
  return (
    <div className="sa-dialog-backdrop" role="presentation" onClick={onCancel}>
      <section
        className="sa-dialog"
        role="dialog"
        aria-modal="true"
        aria-label={`Xác nhận xóa gói ${plan.code}`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sa-dialog-header">
          <div>
            <p className="panel-kicker">Xóa gói dịch vụ</p>
            <h2 className="sa-dialog-title">Xác nhận xóa {plan.code}</h2>
          </div>
          <button
            type="button"
            className="ghost-icon-button"
            onClick={onCancel}
            aria-label="Đóng xác nhận xóa gói"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="sa-dialog-copy">
          <p>
            Hệ thống sẽ kiểm tra ràng buộc an toàn trước khi xóa. Nếu đang có tenant
            sử dụng gói này, thao tác xóa sẽ bị chặn và bạn nên chuyển gói sang trạng
            thái Ẩn.
          </p>
          <div className="sa-chip-row">
            <span className="sa-pill is-slate">{tenantUsageCount(plan)} tenant đang dùng</span>
            <span className={`sa-pill ${planToneClass(plan.status)}`}>
              {planStatusLabel(plan.status)}
            </span>
          </div>
        </div>

        <div className="sa-dialog-actions">
          <button type="button" className="sa-secondary-button" onClick={onCancel}>
            Hủy
          </button>
          <button
            type="button"
            className="sa-danger-button"
            onClick={onConfirm}
            disabled={deletingPlanId === plan.id}
          >
            {deletingPlanId === plan.id ? "Đang xử lý..." : "Xóa gói"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function PlansPanel({
  plans,
  loading,
  currency,
  form,
  errors,
  featureOptions,
  editorMode,
  editorOpen,
  saving,
  menuPlanId,
  pendingDeletePlan,
  deletingPlanId,
  tenantUsageCount,
  onToggleMenu,
  onOpenEdit,
  onCloseEditor,
  onChange,
  onToggleFeature,
  onSubmit,
  onRequestDelete,
  onCancelDelete,
  onConfirmDelete,
}: PlansPanelProps) {
  return (
    <>
      {loading ? (
        <section className="support-card sa-empty-state">
          <span className="material-symbols-outlined">inventory_2</span>
          <p>Đang tải danh mục gói dịch vụ từ Control Plane...</p>
        </section>
      ) : plans.length === 0 ? (
        <section className="support-card sa-empty-state">
          <span className="material-symbols-outlined">inventory_2</span>
          <p>Không có gói dịch vụ nào khớp với bộ lọc hiện tại.</p>
        </section>
      ) : (
        <section className="plan-grid">
          {plans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              usageCount={tenantUsageCount(plan)}
              currency={currency}
              menuOpen={menuPlanId === plan.id}
              onToggleMenu={() => onToggleMenu(menuPlanId === plan.id ? null : plan.id)}
              onEdit={() => {
                onToggleMenu(null);
                onOpenEdit(plan);
              }}
              onDelete={() => {
                onToggleMenu(null);
                onRequestDelete(plan);
              }}
            />
          ))}
        </section>
      )}

      {editorOpen ? (
        <PlanEditorDialog
          form={form}
          errors={errors}
          featureOptions={featureOptions}
          editorMode={editorMode}
          saving={saving}
          currency={currency}
          onClose={onCloseEditor}
          onChange={onChange}
          onToggleFeature={onToggleFeature}
          onSubmit={onSubmit}
        />
      ) : null}

      {pendingDeletePlan ? (
        <PlanDeleteDialog
          plan={pendingDeletePlan}
          deletingPlanId={deletingPlanId}
          tenantUsageCount={tenantUsageCount}
          onCancel={onCancelDelete}
          onConfirm={onConfirmDelete}
        />
      ) : null}
    </>
  );
}
