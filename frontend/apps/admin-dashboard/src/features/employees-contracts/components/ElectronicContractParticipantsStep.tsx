import React, { useMemo, useState } from 'react';
import type { Employee } from '../../employees/types';
import type {
  ElectronicContractParticipant,
  ElectronicParticipantAuthMethod,
  ElectronicParticipantRole,
  ElectronicParticipantSubjectType,
  ElectronicSigningOrderMode,
} from '../types';
import {
  getEmployeeDirectoryMap,
  getEmployeePrimaryEmail,
  getParticipantErrorKey,
} from './electronicContractWorkflow';
import ElectronicContractEmployeePickerModal from './ElectronicContractEmployeePickerModal';

interface ElectronicContractParticipantsStepProps {
  orderMode: ElectronicSigningOrderMode;
  participants: ElectronicContractParticipant[];
  employees: Employee[];
  errors: Record<string, string>;
  onOrderModeChange: (mode: ElectronicSigningOrderMode) => void;
  onParticipantChange: <K extends keyof ElectronicContractParticipant>(
    participantId: string,
    field: K,
    value: ElectronicContractParticipant[K],
  ) => void;
  onAddParticipant: () => void;
  onRemoveParticipant: (participantId: string) => void;
  onReorderParticipant: (draggedParticipantId: string, targetParticipantId: string) => void;
}

const getInputClassName = (hasError: boolean) =>
  `min-h-12 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors ${
    hasError
      ? 'border-rose-300 bg-rose-50/40'
      : 'border-slate-200 bg-white focus:border-[#134BBA]'
  }`;

const ElectronicContractParticipantsStep: React.FC<ElectronicContractParticipantsStepProps> = ({
  orderMode,
  participants,
  employees,
  errors,
  onOrderModeChange,
  onParticipantChange,
  onAddParticipant,
  onRemoveParticipant,
  onReorderParticipant,
}) => {
  const employeeMap = useMemo(() => getEmployeeDirectoryMap(employees), [employees]);
  const [pickerParticipantId, setPickerParticipantId] = useState<string | null>(null);

  return (
    <>
      <div className="space-y-6 p-6 lg:p-8">
        <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
              <span className="material-symbols-outlined text-[28px]">groups</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">Bước 3: Thiết lập người tham gia</h3>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Khai báo người tham gia vào luồng ký, chọn vai trò, phương thức xác thực và thứ tự ký nếu cần.
              </p>
            </div>
          </div>
        </div>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h4 className="text-lg font-bold text-slate-900">Thứ tự ký</h4>
              <p className="mt-1 text-sm text-slate-500">Chọn chế độ ký tự do hoặc theo thứ tự để bật khả năng kéo thả sắp xếp block người tham gia.</p>
            </div>
            <button
              type="button"
              onClick={onAddParticipant}
              className="inline-flex items-center rounded-full bg-[#134BBA] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#0f3f9f]"
            >
              <span className="material-symbols-outlined mr-2 text-[18px]">add</span>
              Thêm người tham gia
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              {
                value: 'free' as const,
                title: 'Tự do',
                subtitle: 'Hệ thống cho phép các bên ký linh hoạt, không bắt buộc thứ tự trước sau.',
              },
              {
                value: 'ordered' as const,
                title: 'Theo thứ tự',
                subtitle: 'Hiển thị icon kéo thả ở từng block để HR chủ động sắp xếp trình tự ký.',
              },
            ].map((option) => {
              const isSelected = orderMode === option.value;

              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-start gap-3 rounded-[24px] border p-4 transition-all ${
                    isSelected ? 'border-[#134BBA] bg-[#134BBA]/5' : 'border-slate-200 bg-white'
                  }`}
                >
                  <input
                    type="radio"
                    name="electronic-order-mode"
                    checked={isSelected}
                    onChange={() => onOrderModeChange(option.value)}
                    className="mt-1 h-4 w-4 accent-[#134BBA]"
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{option.title}</p>
                    <p className="mt-1 text-sm leading-6 text-slate-500">{option.subtitle}</p>
                  </div>
                </label>
              );
            })}
          </div>

          {errors['participants.root'] ? (
            <p className="mt-4 text-sm font-medium text-rose-500">{errors['participants.root']}</p>
          ) : null}
        </section>

        <div className="space-y-4">
          {participants.map((participant, index) => {
            const selectedEmployee = employeeMap.get(participant.employeeId) ?? null;
            const employeeEmail = getEmployeePrimaryEmail(selectedEmployee);
            const subjectTypeError = errors[getParticipantErrorKey(participant.id, 'employeeId')];
            const partnerNameError = errors[getParticipantErrorKey(participant.id, 'partnerName')];
            const partnerEmailError = errors[getParticipantErrorKey(participant.id, 'partnerEmail')];
            const roleError = errors[getParticipantErrorKey(participant.id, 'role')];
            const authMethodError = errors[getParticipantErrorKey(participant.id, 'authMethod')];

            return (
              <section
                key={participant.id}
                draggable={orderMode === 'ordered'}
                onDragStart={(event) => {
                  if (orderMode !== 'ordered') {
                    return;
                  }

                  event.dataTransfer.effectAllowed = 'move';
                  event.dataTransfer.setData('application/x-electronic-participant-id', participant.id);
                }}
                onDragOver={(event) => {
                  if (orderMode === 'ordered') {
                    event.preventDefault();
                  }
                }}
                onDrop={(event) => {
                  if (orderMode !== 'ordered') {
                    return;
                  }

                  event.preventDefault();
                  const draggedParticipantId = event.dataTransfer.getData('application/x-electronic-participant-id');
                  if (draggedParticipantId && draggedParticipantId !== participant.id) {
                    onReorderParticipant(draggedParticipantId, participant.id);
                  }
                }}
                className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {orderMode === 'ordered' ? (
                      <span className="material-symbols-outlined text-[20px] text-slate-400">drag_indicator</span>
                    ) : null}
                    <div>
                      <h4 className="text-base font-bold text-slate-900">Người tham gia {index + 1}</h4>
                      <p className="text-sm text-slate-500">Chọn đúng đối tượng ký và phương thức xác thực cho block này.</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onRemoveParticipant(participant.id)}
                    disabled={participants.length === 1}
                    className="inline-flex items-center rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined mr-1.5 text-[18px]">delete</span>
                    Xóa
                  </button>
                </div>

                <div className="mt-5 grid gap-5 lg:grid-cols-2">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">
                      Đối tượng ký <span className="text-rose-500">*</span>
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {[
                        { value: 'internal' as const, label: 'Tổ chức của tôi' },
                        { value: 'partner' as const, label: 'Đối tác' },
                      ].map((option) => {
                        const isSelected = participant.subjectType === option.value;

                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 ${
                              isSelected ? 'border-[#134BBA] bg-[#134BBA]/5' : 'border-slate-200 bg-white'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`subject-type-${participant.id}`}
                              checked={isSelected}
                              onChange={() =>
                                onParticipantChange(
                                  participant.id,
                                  'subjectType',
                                  option.value as ElectronicParticipantSubjectType,
                                )
                              }
                              className="h-4 w-4 accent-[#134BBA]"
                            />
                            <span className="text-sm font-semibold text-slate-800">{option.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    {participant.subjectType === 'internal' ? (
                      <div className="space-y-3">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-700">
                            Nhân viên <span className="text-rose-500">*</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => setPickerParticipantId(participant.id)}
                            className={`${getInputClassName(Boolean(subjectTypeError))} flex items-center justify-between text-left`}
                          >
                            <span className={selectedEmployee ? 'font-medium text-slate-900' : 'text-slate-400'}>
                              {selectedEmployee?.fullName || 'Chọn nhân viên nội bộ'}
                            </span>
                            <span className="material-symbols-outlined text-[20px] text-slate-400">search</span>
                          </button>
                          {subjectTypeError ? (
                            <p className="mt-2 text-xs font-medium text-rose-500">{subjectTypeError}</p>
                          ) : null}
                        </label>

                        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                          <p>
                            Email dùng cho luồng ký:{' '}
                            <span className="font-semibold text-slate-900">{employeeEmail || 'Chưa có email'}</span>
                          </p>
                          <p className="mt-1">
                            CCCD:{' '}
                            <span className="font-semibold text-slate-900">
                              {selectedEmployee?.identityNumber || 'Chưa cập nhật'}
                            </span>
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid gap-4 sm:grid-cols-2">
                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-700">
                            Tên <span className="text-rose-500">*</span>
                          </span>
                          <input
                            type="text"
                            value={participant.partnerName}
                            onChange={(event) => onParticipantChange(participant.id, 'partnerName', event.target.value)}
                            className={getInputClassName(Boolean(partnerNameError))}
                            placeholder="Nhập tên đối tác"
                          />
                          {partnerNameError ? (
                            <p className="mt-2 text-xs font-medium text-rose-500">{partnerNameError}</p>
                          ) : null}
                        </label>

                        <label className="block">
                          <span className="mb-2 block text-sm font-semibold text-slate-700">
                            Email <span className="text-rose-500">*</span>
                          </span>
                          <input
                            type="email"
                            value={participant.partnerEmail}
                            onChange={(event) => onParticipantChange(participant.id, 'partnerEmail', event.target.value)}
                            className={getInputClassName(Boolean(partnerEmailError))}
                            placeholder="partner@company.com"
                          />
                          {partnerEmailError ? (
                            <p className="mt-2 text-xs font-medium text-rose-500">{partnerEmailError}</p>
                          ) : null}
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Vai trò <span className="text-rose-500">*</span>
                      </span>
                      <select
                        value={participant.role}
                        onChange={(event) =>
                          onParticipantChange(participant.id, 'role', event.target.value as ElectronicParticipantRole)
                        }
                        className={getInputClassName(Boolean(roleError))}
                      >
                        <option value="signer">Người ký</option>
                        <option value="viewer">Người xem</option>
                      </select>
                      {roleError ? <p className="mt-2 text-xs font-medium text-rose-500">{roleError}</p> : null}
                    </label>

                    <label className="block">
                      <span className="mb-2 block text-sm font-semibold text-slate-700">
                        Ký / Xác thực <span className="text-rose-500">*</span>
                      </span>
                      <select
                        value={participant.authMethod}
                        onChange={(event) =>
                          onParticipantChange(
                            participant.id,
                            'authMethod',
                            event.target.value as ElectronicParticipantAuthMethod,
                          )
                        }
                        className={getInputClassName(Boolean(authMethodError))}
                      >
                        <option value="digital-signature">Chữ ký số</option>
                        <option value="image-otp">Ký ảnh (Xác thực OTP Email)</option>
                      </select>
                      {authMethodError ? (
                        <p className="mt-2 text-xs font-medium text-rose-500">{authMethodError}</p>
                      ) : null}
                    </label>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <ElectronicContractEmployeePickerModal
        isOpen={Boolean(pickerParticipantId)}
        employees={employees}
        selectedEmployeeId={
          participants.find((participant) => participant.id === pickerParticipantId)?.employeeId ?? ''
        }
        onClose={() => setPickerParticipantId(null)}
        onSelect={(employeeId) => {
          if (!pickerParticipantId) {
            return;
          }

          onParticipantChange(pickerParticipantId, 'employeeId', employeeId);
        }}
      />
    </>
  );
};

export default ElectronicContractParticipantsStep;
