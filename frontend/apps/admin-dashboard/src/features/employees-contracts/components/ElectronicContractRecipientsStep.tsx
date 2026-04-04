import React from 'react';
import type { Employee } from '../../employees/types';
import type { ElectronicSigningSetupValues } from './ElectronicContractSigningSetupStep';

export interface ElectronicRecipientsValues {
  employeeEmail: string;
  employeePhone: string;
  employeeRoleLabel: string;
  signerEmail: string;
  signerPhone: string;
  signerRoleLabel: string;
  notificationMessage: string;
}

interface ElectronicContractRecipientsStepProps {
  values: ElectronicRecipientsValues;
  errors: Record<string, string>;
  employee: Employee | null;
  signer: Employee | null;
  signerName: string;
  signingSetup: ElectronicSigningSetupValues;
  onFieldChange: <K extends keyof ElectronicRecipientsValues>(
    field: K,
    value: ElectronicRecipientsValues[K],
  ) => void;
}

const ContactCard = ({
  title,
  subtitle,
  icon,
  email,
  phone,
  roleLabel,
  emailError,
  phoneError,
  onEmailChange,
  onPhoneChange,
  onRoleChange,
}: {
  title: string;
  subtitle: string;
  icon: string;
  email: string;
  phone: string;
  roleLabel: string;
  emailError?: string;
  phoneError?: string;
  onEmailChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}) => (
  <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
        <span className="material-symbols-outlined text-[22px]">{icon}</span>
      </div>
      <div>
        <h4 className="text-lg font-bold text-slate-900">{title}</h4>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
    </div>

    <div className="mt-5 space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Vai trò hiển thị</span>
        <input
          type="text"
          value={roleLabel}
          onChange={(event) => onRoleChange(event.target.value)}
          className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#134BBA]"
        />
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Email nhận ký</span>
        <input
          type="email"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          className={`min-h-12 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors ${
            emailError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white focus:border-[#134BBA]'
          }`}
          placeholder="name@company.com"
        />
        {emailError ? <p className="mt-2 text-xs font-medium text-rose-500">{emailError}</p> : null}
      </label>

      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-slate-700">Số điện thoại</span>
        <input
          type="text"
          value={phone}
          onChange={(event) => onPhoneChange(event.target.value)}
          className={`min-h-12 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors ${
            phoneError ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white focus:border-[#134BBA]'
          }`}
          placeholder="Nhập số điện thoại để HR tiện liên hệ"
        />
        {phoneError ? <p className="mt-2 text-xs font-medium text-rose-500">{phoneError}</p> : null}
      </label>
    </div>
  </div>
);

const flowSummaryLabelMap: Record<ElectronicSigningSetupValues['signingFlow'], string> = {
  'company-first': 'Công ty ký trước, sau đó hệ thống gửi sang nhân viên.',
  'employee-first': 'Nhân viên xác nhận trước, sau đó chuyển cho người ký công ty.',
  parallel: 'Hai bên cùng nhận tài liệu và xử lý song song.',
};

const ElectronicContractRecipientsStep: React.FC<ElectronicContractRecipientsStepProps> = ({
  values,
  errors,
  employee,
  signer,
  signerName,
  signingSetup,
  onFieldChange,
}) => {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
            <span className="material-symbols-outlined text-[28px]">groups</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Bước 4: Người nhận ký</h3>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              Xác nhận lại người nhận, thông tin liên hệ và thông điệp đính kèm trước khi khép lại luồng tạo hợp đồng điện tử.
            </p>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-dashed border-[#134BBA]/30 bg-white px-4 py-3 text-sm text-slate-600">
          <span className="font-semibold text-slate-900">Luồng ký hiện tại:</span> {flowSummaryLabelMap[signingSetup.signingFlow]}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ContactCard
          title={employee?.fullName || 'Nhân viên nhận ký'}
          subtitle={[
            employee?.employeeCode,
            employee?.jobTitleName,
            employee?.departmentName,
          ]
            .filter(Boolean)
            .join(' • ') || 'Bên nhận ký phía người lao động'}
          icon="badge"
          email={values.employeeEmail}
          phone={values.employeePhone}
          roleLabel={values.employeeRoleLabel}
          emailError={errors.employeeEmail}
          phoneError={errors.employeePhone}
          onEmailChange={(value) => onFieldChange('employeeEmail', value)}
          onPhoneChange={(value) => onFieldChange('employeePhone', value)}
          onRoleChange={(value) => onFieldChange('employeeRoleLabel', value)}
        />

        <ContactCard
          title={signerName || signer?.fullName || 'Người ký phía công ty'}
          subtitle={[
            signer?.jobTitleName,
            signer?.departmentName,
            signer?.branchName,
          ]
            .filter(Boolean)
            .join(' • ') || 'Đại diện công ty tham gia ký điện tử'}
          icon="workspace_premium"
          email={values.signerEmail}
          phone={values.signerPhone}
          roleLabel={values.signerRoleLabel}
          emailError={errors.signerEmail}
          phoneError={errors.signerPhone}
          onEmailChange={(value) => onFieldChange('signerEmail', value)}
          onPhoneChange={(value) => onFieldChange('signerPhone', value)}
          onRoleChange={(value) => onFieldChange('signerRoleLabel', value)}
        />
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h4 className="text-lg font-bold text-slate-900">Thông điệp gửi cùng hợp đồng</h4>
        <p className="mt-1 text-sm text-slate-500">Nội dung này có thể hiển thị trong email hoặc thông báo khi hệ thống kích hoạt quy trình ký.</p>

        <label className="mt-5 block">
          <textarea
            rows={5}
            value={values.notificationMessage}
            onChange={(event) => onFieldChange('notificationMessage', event.target.value)}
            className={`w-full rounded-[24px] border px-4 py-3 text-sm text-slate-900 outline-none transition-colors ${
              errors.notificationMessage ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white focus:border-[#134BBA]'
            }`}
            placeholder="Nhập thông điệp sẽ gửi kèm để người nhận ký hiểu bối cảnh và hạn xử lý."
          />
          {errors.notificationMessage ? (
            <p className="mt-2 text-xs font-medium text-rose-500">{errors.notificationMessage}</p>
          ) : null}
        </label>
      </section>
    </div>
  );
};

export default ElectronicContractRecipientsStep;
