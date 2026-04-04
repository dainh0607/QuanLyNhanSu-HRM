import React, { useMemo } from 'react';
import type { Employee } from '../../employees/types';
import type {
  ElectronicContractFormValues,
  ElectronicContractParticipant,
  ElectronicContractSignatureField,
} from '../types';
import {
  getEmployeeDirectoryMap,
  getParticipantAuthMethodLabel,
  getParticipantDisplayName,
  getParticipantEmail,
  getParticipantRoleLabel,
  getParticipantSubjectLabel,
} from './electronicContractWorkflow';
import { formatDisplayDate } from '../utils';

interface ElectronicContractSummaryStepProps {
  formValues: ElectronicContractFormValues;
  contractTypeLabel: string;
  employees: Employee[];
  participants: ElectronicContractParticipant[];
  signatureFields: ElectronicContractSignatureField[];
  sourceLabel: string;
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
  <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
    <p className="mt-2 text-base font-semibold text-slate-900">{value}</p>
    {supportingText ? <p className="mt-1 text-sm text-slate-500">{supportingText}</p> : null}
  </div>
);

const ElectronicContractSummaryStep: React.FC<ElectronicContractSummaryStepProps> = ({
  formValues,
  contractTypeLabel,
  employees,
  participants,
  signatureFields,
  sourceLabel,
}) => {
  const employeeMap = useMemo(() => getEmployeeDirectoryMap(employees), [employees]);
  const contractTitle = formValues.templateName || formValues.attachmentName || `Hợp đồng điện tử ${formValues.contractNumber}`;

  const signatureFieldCountByParticipant = useMemo(() => {
    const counts = new Map<string, number>();
    signatureFields.forEach((field) => {
      if (!field.participantId) {
        return;
      }

      counts.set(field.participantId, (counts.get(field.participantId) ?? 0) + 1);
    });

    return counts;
  }, [signatureFields]);

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="rounded-[28px] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-sky-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500 text-white">
            <span className="material-symbols-outlined text-[28px]">task_alt</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Bước 5: Xem lại toàn bộ cấu hình</h3>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Đây là màn tổng kết chỉ đọc, giúp HR rà soát thông tin hợp đồng, người tham gia và số vị trí ký trước khi phát hành.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-bold text-slate-900">Thông tin hợp đồng</h4>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <SummaryTile label="Tên hợp đồng" value={contractTitle || 'Chưa cập nhật'} />
          <SummaryTile label="Số hợp đồng" value={formValues.contractNumber || 'Chưa cập nhật'} />
          <SummaryTile
            label="File hợp đồng"
            value={sourceLabel || 'Chưa có file'}
            supportingText={formValues.templateName ? 'Sinh từ mẫu hợp đồng đã chọn ở bước 1' : 'Dùng tệp đính kèm hoặc bản xem trước FE'}
          />
          <SummaryTile
            label="Ngày hết hạn"
            value={formatDisplayDate(formValues.expiryDate)}
            supportingText={`Loại hợp đồng: ${contractTypeLabel || 'Chưa cập nhật'}`}
          />
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-lg font-bold text-slate-900">Danh sách người tham gia</h4>
            <p className="mt-1 text-sm text-slate-500">Toàn bộ thông tin đều ở chế độ chỉ xem tại bước này.</p>
          </div>
          <div className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
            {participants.length} người tham gia
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {participants.map((participant, index) => (
            <div
              key={participant.id}
              className="grid gap-4 rounded-[24px] border border-slate-200 bg-slate-50 p-4 lg:grid-cols-[1.3fr_1fr_1fr_1fr_0.8fr]"
            >
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Người tham gia {index + 1}</p>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {getParticipantDisplayName(participant, employeeMap)}
                </p>
                <p className="mt-1 text-sm text-slate-500">{getParticipantEmail(participant, employeeMap) || 'Chưa có email'}</p>
              </div>
              <SummaryTile label="Đối tượng ký" value={getParticipantSubjectLabel(participant.subjectType)} />
              <SummaryTile label="Vai trò" value={getParticipantRoleLabel(participant.role)} />
              <SummaryTile label="Ký / Xác thực" value={getParticipantAuthMethodLabel(participant.authMethod)} />
              <SummaryTile
                label="Vị trí ký"
                value={String(signatureFieldCountByParticipant.get(participant.id) ?? 0)}
                supportingText="Số ô chữ ký đã gán"
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ElectronicContractSummaryStep;
