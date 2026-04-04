import React from 'react';
import type { Employee } from '../../employees/types';
import { formatDisplayDate } from '../utils';

interface ElectronicContractReviewStepProps {
  contractNumber: string;
  contractTypeLabel: string;
  templateName: string;
  attachmentName: string;
  signedBy: string;
  signDate: string;
  expiryDate: string;
  taxType: string;
  employee: Employee | null;
}

const ReviewCard = ({
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

const ChecklistItem = ({
  label,
  checked,
}: {
  label: string;
  checked: boolean;
}) => (
  <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
    <span
      className={`material-symbols-outlined text-[20px] ${
        checked ? 'text-emerald-600' : 'text-slate-300'
      }`}
    >
      {checked ? 'check_circle' : 'radio_button_unchecked'}
    </span>
    <span className={`text-sm font-medium ${checked ? 'text-slate-900' : 'text-slate-500'}`}>{label}</span>
  </div>
);

const ElectronicContractReviewStep: React.FC<ElectronicContractReviewStepProps> = ({
  contractNumber,
  contractTypeLabel,
  templateName,
  attachmentName,
  signedBy,
  signDate,
  expiryDate,
  taxType,
  employee,
}) => {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
            <span className="material-symbols-outlined text-[28px]">fact_check</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Bước 2: Xem lại hợp đồng</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Kiểm tra nhanh nội dung nguồn, đối tượng ký và thông tin hiệu lực trước khi chuyển sang phần thiết lập ký.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <ReviewCard
            label="Nhân viên"
            value={employee?.fullName || 'Chưa cập nhật'}
            supportingText={[
              employee?.employeeCode,
              employee?.jobTitleName,
              employee?.departmentName,
            ]
              .filter(Boolean)
              .join(' • ')}
          />
          <ReviewCard label="Số hợp đồng" value={contractNumber || 'Chưa cập nhật'} />
          <ReviewCard
            label="Nguồn văn bản"
            value={templateName || attachmentName || 'Chưa cập nhật'}
            supportingText={templateName ? 'Mẫu có sẵn của hệ thống' : attachmentName ? 'Tệp được HR tải lên' : undefined}
          />
          <ReviewCard
            label="Người ký / Ngày ký"
            value={signedBy || 'Chưa cập nhật'}
            supportingText={formatDisplayDate(signDate)}
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.95fr]">
        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
              <span className="material-symbols-outlined text-[22px]">description</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Thông tin hợp đồng sẽ dùng ở luồng ký</h4>
              <p className="text-sm text-slate-500">Màn này giúp HR rà lại nội dung trước khi cấu hình người nhận ký.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <ReviewCard label="Loại hợp đồng" value={contractTypeLabel || 'Chưa cập nhật'} />
            <ReviewCard label="Loại thuế TNCN" value={taxType || 'Chưa cập nhật'} />
            <ReviewCard label="Ngày ký" value={formatDisplayDate(signDate)} />
            <ReviewCard label="Ngày hết hạn" value={formatDisplayDate(expiryDate)} />
          </div>
        </div>

        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
              <span className="material-symbols-outlined text-[22px]">playlist_add_check_circle</span>
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Checklist trước khi sang bước 3</h4>
              <p className="text-sm text-slate-500">Các mục dưới đây nên đã sẵn sàng để HR tiếp tục cấu hình ký.</p>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            <ChecklistItem label="Đã chọn nhân viên nhận hợp đồng điện tử" checked={Boolean(employee)} />
            <ChecklistItem label="Đã có ít nhất một nguồn nội dung (mẫu hoặc tệp tải lên)" checked={Boolean(templateName || attachmentName)} />
            <ChecklistItem label="Đã chọn loại hợp đồng và người ký phía công ty" checked={Boolean(contractTypeLabel && signedBy)} />
            <ChecklistItem label="Đã có ngày ký và ngày hết hạn" checked={Boolean(signDate && expiryDate)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ElectronicContractReviewStep;
