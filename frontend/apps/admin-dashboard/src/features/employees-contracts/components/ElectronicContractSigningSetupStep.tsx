import React from 'react';

export interface ElectronicSigningSetupValues {
  signingMethod: 'otp' | 'usb-token' | 'hybrid';
  signingFlow: 'company-first' | 'employee-first' | 'parallel';
  deadlineDate: string;
  reminderFrequency: '4h' | '24h' | '72h';
  completionAction: 'email-copy' | 'archive-only' | 'download-and-email';
  internalNote: string;
}

interface ElectronicContractSigningSetupStepProps {
  values: ElectronicSigningSetupValues;
  errors: Record<string, string>;
  onFieldChange: <K extends keyof ElectronicSigningSetupValues>(
    field: K,
    value: ElectronicSigningSetupValues[K],
  ) => void;
  minDeadlineDate?: string;
}

const OPTION_CARD_CLASS =
  'rounded-[24px] border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-sm';

const ElectronicContractSigningSetupStep: React.FC<ElectronicContractSigningSetupStepProps> = ({
  values,
  errors,
  onFieldChange,
  minDeadlineDate,
}) => {
  return (
    <div className="space-y-6 p-6 lg:p-8">
      <div className="flex items-start gap-4 rounded-[28px] border border-slate-200 bg-slate-50 p-6">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#134BBA]/10 text-[#134BBA]">
          <span className="material-symbols-outlined text-[28px]">draw</span>
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">Bước 3: Thiết lập ký</h3>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Chọn hình thức ký, thứ tự xử lý và các quy tắc nhắc hạn để đội HR có thể điều phối quy trình trình ký rõ ràng hơn.
          </p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900">Phương thức ký</h4>
          <p className="mt-1 text-sm text-slate-500">Xác định cách người ký sẽ tương tác với hợp đồng điện tử.</p>

          <div className="mt-5 grid gap-4">
            {[
              {
                value: 'otp',
                title: 'OTP / Email xác nhận',
                subtitle: 'Phù hợp cho hầu hết trường hợp ký từ xa và thao tác nhanh.',
                icon: 'mail_lock',
              },
              {
                value: 'usb-token',
                title: 'USB Token / Chứng thư số',
                subtitle: 'Dùng khi quy trình yêu cầu ký số bằng thiết bị chuyên dụng.',
                icon: 'security_key',
              },
              {
                value: 'hybrid',
                title: 'Kết hợp nhiều phương thức',
                subtitle: 'Cho phép linh hoạt giữa OTP và ký số chuyên dụng theo từng bên.',
                icon: 'hub',
              },
            ].map((option) => {
              const isSelected = values.signingMethod === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onFieldChange('signingMethod', option.value as ElectronicSigningSetupValues['signingMethod'])}
                  className={`${OPTION_CARD_CLASS} ${
                    isSelected
                      ? 'border-[#134BBA] bg-[#134BBA]/5 shadow-[0_16px_35px_rgba(19,75,186,0.12)]'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                        isSelected ? 'bg-[#134BBA] text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">{option.icon}</span>
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900">{option.title}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">{option.subtitle}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {errors.signingMethod ? <p className="mt-3 text-sm font-medium text-rose-500">{errors.signingMethod}</p> : null}
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h4 className="text-lg font-bold text-slate-900">Thứ tự ký</h4>
          <p className="mt-1 text-sm text-slate-500">Chọn xem bên nào sẽ ký trước hoặc để hai bên ký song song.</p>

          <div className="mt-5 grid gap-4">
            {[
              {
                value: 'company-first',
                title: 'Công ty ký trước',
                subtitle: 'Phù hợp khi cần duyệt nội bộ trước khi gửi cho nhân viên.',
              },
              {
                value: 'employee-first',
                title: 'Nhân viên ký trước',
                subtitle: 'Thường dùng khi HR muốn nhân viên xác nhận sớm trước khi đóng dấu cuối cùng.',
              },
              {
                value: 'parallel',
                title: 'Ký song song',
                subtitle: 'Hai bên cùng nhận và xử lý hợp đồng trong cùng thời điểm.',
              },
            ].map((option) => {
              const isSelected = values.signingFlow === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onFieldChange('signingFlow', option.value as ElectronicSigningSetupValues['signingFlow'])}
                  className={`${OPTION_CARD_CLASS} ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-50'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <p className="text-base font-semibold text-slate-900">{option.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-500">{option.subtitle}</p>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-5 lg:grid-cols-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Hạn hoàn tất ký</span>
            <input
              type="date"
              value={values.deadlineDate}
              min={minDeadlineDate}
              onChange={(event) => onFieldChange('deadlineDate', event.target.value)}
              className={`min-h-12 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors ${
                errors.deadlineDate ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white focus:border-[#134BBA]'
              }`}
            />
            {errors.deadlineDate ? <p className="mt-2 text-xs font-medium text-rose-500">{errors.deadlineDate}</p> : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Tần suất nhắc hạn</span>
            <select
              value={values.reminderFrequency}
              onChange={(event) => onFieldChange('reminderFrequency', event.target.value as ElectronicSigningSetupValues['reminderFrequency'])}
              className={`min-h-12 w-full rounded-2xl border px-4 py-3 text-sm text-slate-900 outline-none transition-colors ${
                errors.reminderFrequency ? 'border-rose-300 bg-rose-50/40' : 'border-slate-200 bg-white focus:border-[#134BBA]'
              }`}
            >
              <option value="4h">Nhắc mỗi 4 giờ</option>
              <option value="24h">Nhắc mỗi 24 giờ</option>
              <option value="72h">Nhắc mỗi 72 giờ</option>
            </select>
            {errors.reminderFrequency ? (
              <p className="mt-2 text-xs font-medium text-rose-500">{errors.reminderFrequency}</p>
            ) : null}
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Sau khi hoàn tất</span>
            <select
              value={values.completionAction}
              onChange={(event) => onFieldChange('completionAction', event.target.value as ElectronicSigningSetupValues['completionAction'])}
              className="min-h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#134BBA]"
            >
              <option value="email-copy">Gửi bản sao qua email</option>
              <option value="archive-only">Lưu hồ sơ trên hệ thống</option>
              <option value="download-and-email">Lưu hồ sơ và đính kèm file PDF</option>
            </select>
          </label>
        </div>

        <label className="mt-5 block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">Ghi chú nội bộ cho luồng ký</span>
          <textarea
            rows={4}
            value={values.internalNote}
            onChange={(event) => onFieldChange('internalNote', event.target.value)}
            className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-[#134BBA]"
            placeholder="Ví dụ: Ưu tiên gửi trước 09:00 sáng, HR phụ trách theo dõi hạn ký trong ngày."
          />
        </label>
      </section>
    </div>
  );
};

export default ElectronicContractSigningSetupStep;
