import React from 'react';
import type { ContractListItem } from '../types';
import ModalShell from './ModalShell';

interface ContractPreviewModalProps {
  contract: ContractListItem | null;
  onClose: () => void;
}

const ContractPreviewModal: React.FC<ContractPreviewModalProps> = ({ contract, onClose }) => {
  return (
    <ModalShell
      isOpen={contract !== null}
      onClose={onClose}
      title="Chi tiết hợp đồng"
      description="Xem nhanh thông tin tổng hợp của hợp đồng được chọn."
    >
      {contract ? (
        <div className="grid gap-4 p-6 lg:grid-cols-2 lg:p-8">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Số hợp đồng</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{contract.contractNumber || 'Chưa cập nhật'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nhân viên</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{contract.fullName}</p>
            <p className="mt-1 text-sm text-slate-500">{contract.employeeCode}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loại hợp đồng</p>
            <p className="mt-2 text-base font-semibold text-slate-900">
              {contract.contractTypeName || 'Chưa cập nhật'}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trạng thái</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${contract.statusColorClassName}`}>
              {contract.statusLabel}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ngày ký</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{contract.signDateLabel}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ngày hết hạn</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{contract.expiryDateLabel}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Người ký</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{contract.signedBy || 'Chưa cập nhật'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loại thuế TNCN</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{contract.taxType || 'Chưa cập nhật'}</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tệp đính kèm</p>
            {contract.attachment ? (
              <a
                href={contract.attachment}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#134BBA] hover:underline"
              >
                <span className="material-symbols-outlined text-[18px]">attach_file</span>
                Mở tệp đã tải lên
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Chưa có tệp đính kèm.</p>
            )}
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
};

export default ContractPreviewModal;
