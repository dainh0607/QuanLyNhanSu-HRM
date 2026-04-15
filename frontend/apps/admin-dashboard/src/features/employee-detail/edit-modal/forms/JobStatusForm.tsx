import React, { useState, useEffect } from 'react';
import type { EmployeeEditJobStatusPayload, LateEarlyRule } from '../../../../services/employee/types';
import { DatePickerInput, FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';
import { WORK_TYPE_OPTIONS } from '../constants';

interface JobStatusFormProps {
  data: EmployeeEditJobStatusPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditJobStatusPayload>(
    field: F,
    value: EmployeeEditJobStatusPayload[F],
  ) => void;
}

const JobStatusForm: React.FC<JobStatusFormProps> = ({ data, errors, onFieldChange }) => {
  // Mode selection: true = Total time, false = Detailed late/early
  const [isTotalMode, setIsTotalMode] = useState(!data.lateAllowedMinutes && !data.earlyAllowedMinutes);

  useEffect(() => {
    // If we have detailed values, we should be in detailed mode
    if (data.lateAllowedMinutes || data.earlyAllowedMinutes) {
      setIsTotalMode(false);
    }
  }, []);

  const handleModeChange = (total: boolean) => {
    setIsTotalMode(total);
    if (total) {
      onFieldChange('lateAllowedMinutes', '');
      onFieldChange('earlyAllowedMinutes', '');
    } else {
      onFieldChange('lateEarlyAllowed', '');
    }
  };

  const handleAddRule = (type: 'LATE' | 'EARLY' | 'TOTAL' = 'TOTAL') => {
    const newRule: LateEarlyRule & { type?: string } = {
      id: Math.random().toString(36).substr(2, 9),
      type: type,
      startDate: '',
      endDate: '',
      minutes: '0'
    };
    onFieldChange('lateEarlyDetailedRules', [...data.lateEarlyDetailedRules, newRule as any]);
  };

  const handleRemoveRule = (id: string) => {
    onFieldChange('lateEarlyDetailedRules', data.lateEarlyDetailedRules.filter(r => r.id !== id));
  };

  const handleRuleChange = (id: string, field: keyof Omit<LateEarlyRule, 'id'>, value: string) => {
    onFieldChange('lateEarlyDetailedRules', data.lateEarlyDetailedRules.map(r => 
      r.id === id ? { ...r, [field]: value } : r
    ));
  };

  const renderRuleBox = (rule: LateEarlyRule & { type?: string }) => (
    <div key={rule.id} className="relative mt-4 rounded-[24px] border border-slate-100 bg-white p-6 pt-10 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <button 
        onClick={() => handleRemoveRule(rule.id)}
        className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-500"
      >
        <span className="material-symbols-outlined text-[18px]">close</span>
      </button>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-sm font-bold text-slate-800">
            Khoảng thời gian <span className="text-rose-500">*</span>
          </label>
          <div className="flex items-center gap-3">
            <DatePickerInput
              value={rule.startDate}
              onChange={(v) => handleRuleChange(rule.id, 'startDate', v)}
              className="h-11 flex-1 !rounded-xl !border-none !bg-[#F8FAFC] !px-4 !text-sm !outline-none"
              placeholder="Ngày bắt đầu"
            />
            <span className="text-slate-400">~</span>
            <DatePickerInput
              value={rule.endDate}
              onChange={(v) => handleRuleChange(rule.id, 'endDate', v)}
              className="h-11 flex-1 !rounded-xl !border-none !bg-[#F8FAFC] !px-4 !text-sm !outline-none"
              placeholder="Ngày kết thúc"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] items-center gap-4">
          <label className="text-sm font-bold text-slate-800">Số phút</label>
          <input
            type="text"
            value={rule.minutes}
            onChange={(e) => handleRuleChange(rule.id, 'minutes', e.target.value.replace(/\D/g, ''))}
            className="h-11 w-full rounded-xl border-none bg-[#F8FAFC] px-4 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/10"
            placeholder="1"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-5xl">
      <FormHeading title="Tình trạng công việc" />

      <div className="divide-y divide-slate-100/80">
        <FormRow
          label="Ngày vào làm"
          description="Ngày nhân viên thử việc tại tổ chức"
          error={errors.probationStartDate}
        >
          <div className="max-w-[500px]">
            <DatePickerInput
              value={data.probationStartDate}
              onChange={(value) => onFieldChange('probationStartDate', value)}
              hasError={Boolean(errors.probationStartDate)}
              ariaLabel="ngày vào làm"
            />
          </div>
        </FormRow>

        <FormRow
          label="Ngày ký hợp đồng lao động"
          description="Ngày nhân viên làm việc chính thức tại tổ chức. Thời gian này có liên quan đến việc thiết lập lập Hợp đồng lao động"
          error={errors.contractSignDate}
        >
          <div className="max-w-[500px]">
            <DatePickerInput
              value={data.contractSignDate}
              onChange={(value) => onFieldChange('contractSignDate', value)}
              hasError={Boolean(errors.contractSignDate)}
              ariaLabel="ngày ký hợp đồng"
            />
          </div>
        </FormRow>

        <FormRow
          label="Ngày hết hạn"
          description="Ngày kết thúc hợp đồng lao động"
          error={errors.contractExpiryDate}
        >
          <div className="max-w-[500px]">
            <DatePickerInput
              value={data.contractExpiryDate}
              onChange={(value) => onFieldChange('contractExpiryDate', value)}
              hasError={Boolean(errors.contractExpiryDate)}
              ariaLabel="ngày hết hạn"
            />
          </div>
        </FormRow>

        <FormRow label="Hình thức làm việc" error={errors.workType}>
          <div className="relative group max-w-[500px]">
            <select
              value={data.workType}
              onChange={(e) => onFieldChange('workType', e.target.value)}
              className={`${getFieldClassName(Boolean(errors.workType))} appearance-none pr-10 bg-[#f1f5f9]/60 border-slate-200/80 hover:bg-white hover:border-emerald-300 transition-all cursor-pointer`}
            >
              <option value="">Hình thức làm việc</option>
              {WORK_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-500">
              expand_more
            </span>
          </div>
        </FormRow>

        <FormRow
          label="Số tháng thâm niên cộng thêm"
          description="Số tháng làm việc được tính thâm niên trước khi vào làm việc tại công ty"
          error={errors.seniorityMonths}
        >
          <div className="max-w-[500px]">
            <input
              type="text"
              value={data.seniorityMonths}
              onChange={(e) => onFieldChange('seniorityMonths', e.target.value.replace(/\D/g, ''))}
              className={`${getFieldClassName(Boolean(errors.seniorityMonths))} bg-[#f1f5f9]/60 border-slate-200/80 hover:bg-white hover:border-emerald-300 transition-all`}
              placeholder="0"
            />
          </div>
        </FormRow>

        <div className="py-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-6 w-1 rounded-full bg-emerald-500"></div>
            <h4 className="text-[17px] font-bold text-slate-800">Đi muộn/Về sớm</h4>
          </div>

          <div className="rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm">
            <div className="space-y-10">
              {/* Chế độ 1: Tổng thời gian */}
              <div className="flex items-start gap-5">
                <div 
                  onClick={() => handleModeChange(true)}
                  className={`mt-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg transition-all ${
                    isTotalMode ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white ring-1 ring-slate-200 hover:ring-emerald-300'
                  }`}
                >
                  {isTotalMode && <span className="material-symbols-outlined text-[16px] text-white font-bold">check</span>}
                </div>
                <div className="flex-1">
                  <span className="text-[15px] font-bold text-slate-800">Tổng thời gian đi muộn và về sớm</span>
                  {isTotalMode && (
                    <div className="mt-6 space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[14px] font-bold text-slate-900">Cho phép đi trễ sau (phút)</label>
                          <p className="text-[12px] leading-relaxed text-slate-400 max-w-2xl">
                            Thời gian cho phép nhân viên đi muộn và về sớm. Ví dụ: cho phép nhân viên đi muộn và về sớm 60 phút, nhân viên đi muộn 40 phút thì nhân viên chỉ được về sớm 20 phút.
                          </p>
                        </div>
                        <div className="relative group max-w-[500px]">
                          <input
                            type="text"
                            value={data.lateEarlyAllowed}
                            onChange={(e) => onFieldChange('lateEarlyAllowed', e.target.value.replace(/\D/g, ''))}
                            className="h-12 w-full rounded-2xl border-none bg-[#EDF2F9] px-4 pr-20 text-[15px] font-black text-slate-700 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="0"
                          />
                          <button 
                            onClick={() => handleAddRule('TOTAL')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-500 text-[13px] font-bold hover:text-emerald-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Thêm
                          </button>
                        </div>
                      </div>
                      
                      {/* Rules under total mode */}
                      <div className="space-y-4">
                        {data.lateEarlyDetailedRules
                          .filter(r => (r as any).type === 'TOTAL' || !(r as any).type)
                          .map(renderRuleBox)}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chế độ 2: Chi tiết từng loại */}
              <div className="flex items-start gap-5">
                <div 
                  onClick={() => handleModeChange(false)}
                  className={`mt-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg transition-all ${
                    !isTotalMode ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white ring-1 ring-slate-200 hover:ring-emerald-300'
                  }`}
                >
                  {!isTotalMode && <span className="material-symbols-outlined text-[16px] text-white font-bold">check</span>}
                </div>
                <div className="flex-1">
                  <span className="text-[15px] font-bold text-slate-800">Thời gian đi muộn, về sớm</span>
                  {!isTotalMode && (
                    <div className="mt-8 space-y-10 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Đi trễ */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[14px] font-bold text-slate-900">Cho phép đi trễ sau (phút)</label>
                          <p className="text-[12px] leading-relaxed text-slate-400">
                            Thời gian cho phép nhân viên đi muộn và về sớm.
                          </p>
                        </div>
                        <div className="relative group max-w-[500px]">
                          <input
                            type="text"
                            value={data.lateAllowedMinutes}
                            onChange={(e) => onFieldChange('lateAllowedMinutes', e.target.value.replace(/\D/g, ''))}
                            className="h-12 w-full rounded-2xl border-none bg-[#EDF2F9] px-4 pr-20 text-[15px] font-black text-slate-700 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="0"
                          />
                          <button 
                            onClick={() => handleAddRule('LATE')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-500 text-[13px] font-bold hover:text-emerald-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Thêm
                          </button>
                        </div>
                        
                        {/* Rules for Late */}
                        <div className="space-y-4">
                          {data.lateEarlyDetailedRules
                            .filter(r => (r as any).type === 'LATE')
                            .map(renderRuleBox)}
                        </div>
                      </div>

                      {/* Về sớm */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[14px] font-bold text-slate-900">Cho phép về sớm trước (phút)</label>
                          <p className="text-[12px] leading-relaxed text-slate-400">
                            Thời gian cho phép nhân viên đi muộn và về sớm.
                          </p>
                        </div>
                        <div className="relative group max-w-[500px]">
                          <input
                            type="text"
                            value={data.earlyAllowedMinutes}
                            onChange={(e) => onFieldChange('earlyAllowedMinutes', e.target.value.replace(/\D/g, ''))}
                            className="h-12 w-full rounded-2xl border-none bg-[#EDF2F9] px-4 pr-20 text-[15px] font-black text-slate-700 outline-none transition-all focus:ring-2 focus:ring-emerald-500/20"
                            placeholder="0"
                          />
                          <button 
                            onClick={() => handleAddRule('EARLY')}
                            className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-emerald-500 text-[13px] font-bold hover:text-emerald-600 transition-colors"
                          >
                            <span className="material-symbols-outlined text-[18px]">add</span>
                            Thêm
                          </button>
                        </div>

                        {/* Rules for Early */}
                        <div className="space-y-4">
                          {data.lateEarlyDetailedRules
                            .filter(r => (r as any).type === 'EARLY')
                            .map(renderRuleBox)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <FormRow label="Ghi chú" error={errors.lateEarlyNote}>
          <div className="max-w-[800px]">
            <textarea
              value={data.lateEarlyNote}
              onChange={(e) => onFieldChange('lateEarlyNote', e.target.value)}
              className={`${getFieldClassName(Boolean(errors.lateEarlyNote))} min-h-[120px] resize-none py-4 bg-[#f1f5f9]/60 border-slate-200/80 hover:bg-white hover:border-emerald-300 transition-all`}
              placeholder="Ghi chú"
            />
          </div>
        </FormRow>

        <FormRow 
          label="Nghỉ việc"
          description="Chọn nút này để check nhân viên nghỉ việc, nhân viên sẽ không bị xóa khỏi hệ thống mà vẫn có thể lưu trữ hồ sơ. Bạn cần điền thêm lý do nghỉ việc."
        >
          <div className="flex items-start justify-between max-w-[500px]">
            <div 
              onClick={() => onFieldChange('isResigned', !data.isResigned)}
              className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-[10px] transition-all ${
                data.isResigned ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-[#f1f5f9] ring-1 ring-slate-200 hover:ring-emerald-300'
              }`}
            >
              {data.isResigned && <span className="material-symbols-outlined text-[20px] text-white">check</span>}
            </div>
          </div>
          
          {data.isResigned && (
            <div className="mt-6 animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="text-[13px] font-bold text-slate-900 block mb-2">Lý do nghỉ việc</label>
              <textarea
                value={data.resignationReason}
                onChange={(e) => onFieldChange('resignationReason', e.target.value)}
                className={`${getFieldClassName(Boolean(errors.resignationReason))} min-h-[100px] resize-none py-3 border-emerald-200 bg-emerald-50/10`}
                placeholder="Nhập lý do nghỉ việc..."
                autoFocus
              />
            </div>
          )}
        </FormRow>
      </div>
    </div>
  );
};

export default JobStatusForm;
