import React from 'react';
import type { Employee } from '../../employees/types';
import { formatDisplayDate } from '../utils';
import type { ElectronicRecipientsValues } from './ElectronicContractRecipientsStep';
import type { ElectronicSigningSetupValues } from './ElectronicContractSigningSetupStep';

interface ElectronicContractCompletionStepProps {
  contractNumber: string;
  contractTypeLabel: string;
  templateName: string;
  attachmentName: string;
  signDate: string;
  expiryDate: string;
  employee: Employee | null;
  signer: Employee | null;
  signerName: string;
  signingSetup: ElectronicSigningSetupValues;
  recipients: ElectronicRecipientsValues;
}

const SummaryTile = ({
  label,
  value,
  supportingText,
}: {
  label: string;
  value: string;
  supportingText?: string;
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
    {supportingText ? <p className="mt-1 text-sm text-slate-500">{supportingText}</p> : null}
  </div>
);

const signingMethodLabelMap: Record<ElectronicSigningSetupValues['signingMethod'], string> = {
  otp: 'OTP / Email xác nhận',
  'usb-token': 'USB Token / Chứng thư số',
  hybrid: 'Kết hợp nhiều phương thức',
};

const signingFlowLabelMap: Record<ElectronicSigningSetupValues['signingFlow'], string> = {
  'company-first': 'Công ty ký trước',
  'employee-first': 'Nhân viên ký trước',
  parallel: 'Ký song song',
};

const completionActionLabelMap: Record<ElectronicSigningSetupValues['completionAction'], string> = {
  'email-copy': 'Gửi bản sao qua email',
  'archive-only': 'Lưu hồ sơ trên hệ thống',
  'download-and-email': 'Lưu hồ sơ và đính kèm file PDF',
};

const ElectronicContractCompletionStep: React.FC<ElectronicContractCompletionStepProps> = ({
  contractNumber,
  contractTypeLabel,
  templateName,
  attachmentName,
  signDate,
  expiryDate,
  employee,
  signer,
  signerName,
  signingSetup,
  recipients,
}) => {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white shadow-sm">
            <span className="material-symbols-outlined text-[28px]">task_alt</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Bước 5: Hoàn tất giao diện hợp đồng điện tử</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              HR đã cấu hình xong toàn bộ thông tin hiển thị cho luồng ký. Màn này dùng để rà soát lần cuối trước khi đóng modal.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-emerald-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Lưu ý phạm vi hiện tại:</span> phần này đang hoàn thiện về giao diện FE và trải nghiệm nhiều bước. Nghiệp vụ trình ký số thực tế sẽ được nối thêm khi có API phù hợp.
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.95fr]">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900">Tổng quan hợp đồng</h4>
          <p className="mt-1 text-sm text-slate-500">Các dữ liệu nguồn và cấu hình ký đã được gom lại để dễ rà soát.</p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <SummaryTile label="Số hợp đồng" value={contractNumber || 'Chưa cập nhật'} />
            <SummaryTile label="Loại hợp đồng" value={contractTypeLabel || 'Chưa cập nhật'} />
            <SummaryTile
              label="Nguồn nội dung"
              value={templateName || attachmentName || 'Chưa cập nhật'}
              supportingText={templateName ? 'Mẫu nội bộ của hệ thống' : attachmentName ? 'Tài liệu HR tải lên' : undefined}
            />
            <SummaryTile
              label="Ngày ký / hết hạn"
              value={`${formatDisplayDate(signDate)} → ${formatDisplayDate(expiryDate)}`}
            />
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <h4 className="text-lg font-bold text-slate-900">Tóm tắt thiết lập ký</h4>
          <div className="mt-5 space-y-3">
            <SummaryTile label="Phương thức ký" value={signingMethodLabelMap[signingSetup.signingMethod]} />
            <SummaryTile label="Thứ tự ký" value={signingFlowLabelMap[signingSetup.signingFlow]} />
            <SummaryTile label="Hạn hoàn tất" value={formatDisplayDate(signingSetup.deadlineDate)} />
            <SummaryTile label="Sau khi hoàn tất" value={completionActionLabelMap[signingSetup.completionAction]} />
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-bold text-slate-900">Danh sách người nhận</h4>
        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <SummaryTile
            label="Nhân viên nhận ký"
            value={employee?.fullName || 'Chưa cập nhật'}
            supportingText={[recipients.employeeRoleLabel, recipients.employeeEmail, recipients.employeePhone].filter(Boolean).join(' • ')}
          />
          <SummaryTile
            label="Người ký phía công ty"
            value={signerName || signer?.fullName || 'Chưa cập nhật'}
            supportingText={[recipients.signerRoleLabel, recipients.signerEmail, recipients.signerPhone].filter(Boolean).join(' • ')}
          />
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Thông điệp gửi cùng hợp đồng</p>
          <p className="mt-2 text-sm leading-6 text-slate-700">{recipients.notificationMessage || 'Chưa cập nhật thông điệp.'}</p>
        </div>
      </section>
    </div>
  );
};

export default ElectronicContractCompletionStep;
