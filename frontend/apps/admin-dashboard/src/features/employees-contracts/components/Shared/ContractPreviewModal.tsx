import React from 'react';
import type { ContractDto, ContractListItem } from '../../types';
import { formatDisplayDate } from '../../utils';
import ModalShell from './ModalShell';

interface ContractPreviewModalProps {
  contract: ContractListItem | null;
  contractDetail?: ContractDto | null;
  isLoading?: boolean;
  onClose: () => void;
}

const fallbackStatusClassName = 'border border-slate-200 bg-slate-100 text-slate-700';

const ContractPreviewModal: React.FC<ContractPreviewModalProps> = ({
  contract,
  contractDetail,
  isLoading = false,
  onClose,
}) => {
  const employeeName = contractDetail?.employeeName || contract?.fullName || 'Chua cap nhat';
  const employeeCode = contract?.employeeCode || '';
  const contractNumber = contractDetail?.contractNumber || contract?.contractNumber || 'Chua cap nhat';
  const contractTypeName = contractDetail?.contractTypeName || contract?.contractTypeName || 'Chua cap nhat';
  const signDateLabel = formatDisplayDate(contractDetail?.signDate ?? contract?.signDate);
  const expiryDateLabel = formatDisplayDate(contractDetail?.expiryDate ?? contract?.expiryDate);
  const signedBy = contractDetail?.signedBy || contract?.signedBy || 'Chua cap nhat';
  const taxType = contractDetail?.taxType || contract?.taxType || 'Chua cap nhat';
  const attachment = contractDetail?.attachment || contract?.attachment || '';
  const statusLabel = contract?.statusLabel || contractDetail?.status || 'Chua cap nhat';
  const statusColorClassName = contract?.statusColorClassName || fallbackStatusClassName;

  return (
    <ModalShell
      isOpen={contract !== null}
      onClose={onClose}
      title="Chi tiet hop dong"
      description="Xem nhanh thong tin tong hop cua hop dong duoc chon."
    >
      {contract ? (
        <div className="grid gap-4 p-6 lg:grid-cols-2 lg:p-8">
          {isLoading ? (
            <div className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700 lg:col-span-2">
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-sky-200 border-t-sky-600" />
              Dang tai chi tiet hop dong tu API...
            </div>
          ) : null}

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">So hop dong</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{contractNumber}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nhan vien</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{employeeName}</p>
            {employeeCode ? <p className="mt-1 text-sm text-slate-500">{employeeCode}</p> : null}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loai hop dong</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{contractTypeName}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Trang thai</p>
            <span className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusColorClassName}`}>
              {statusLabel}
            </span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ngay ky</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{signDateLabel}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Ngay het han</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{expiryDateLabel}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nguoi ky</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{signedBy}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Loai thue TNCN</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{taxType}</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 lg:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Tep dinh kem</p>
            {attachment ? (
              <a
                href={attachment}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-2 text-sm font-semibold text-[#134BBA] hover:underline"
              >
                <span className="material-symbols-outlined text-[18px]">attach_file</span>
                Mo tep da tai len
              </a>
            ) : (
              <p className="mt-2 text-sm text-slate-500">Chua co tep dinh kem.</p>
            )}
          </div>
        </div>
      ) : null}
    </ModalShell>
  );
};

export default ContractPreviewModal;
