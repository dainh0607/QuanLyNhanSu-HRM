import React, { useState, useEffect } from 'react';
import type { EmployeeEditJobStatusPayload, LateEarlyRule } from '../../../../services/employee/types';
import { DatePickerInput, FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';
import { WORK_TYPE_OPTIONS } from '../constants';
import { employeeMetadataService } from '../../../../services/employeeService';

interface JobStatusFormProps {
  data: EmployeeEditJobStatusPayload;
  errors: Record<string, string>;
  onFieldChange: <F extends keyof EmployeeEditJobStatusPayload>(
    field: F,
    value: EmployeeEditJobStatusPayload[F],
  ) => void;
}

const JobStatusForm: React.FC<JobStatusFormProps> = ({ data, errors, onFieldChange }) => {
  const [resignationReasons, setResignationReasons] = useState<any[]>([]);
  const [isCreatingReason, setIsCreatingReason] = useState(false);
  const [newReasonName, setNewReasonName] = useState('');

  useEffect(() => {
    fetchResignationReasons();
  }, []);

  const fetchResignationReasons = async () => {
    const reasons = await employeeMetadataService.getResignationReasonsMetadata();
    setResignationReasons(reasons);
  };

  const handleCreateReason = async () => {
    if (!newReasonName.trim()) return;
    const result = await employeeMetadataService.createResignationReason(newReasonName.trim());
    if (result) {
      setNewReasonName('');
      setIsCreatingReason(false);
      await fetchResignationReasons();
      onFieldChange('resignationReason', result.reason_name);
    }
  };

  const handleAddRule = (type: 'TOTAL' | 'LATE' | 'EARLY') => {
    const newRule: LateEarlyRule = {
      id: Math.random().toString(36).substr(2, 9),
      startDate: '',
      endDate: '',
      minutes: '0'
    };
    
    if (type === 'TOTAL') {
      onFieldChange('totalLateEarlyRules', [...data.totalLateEarlyRules, newRule]);
    } else if (type === 'LATE') {
      onFieldChange('lateRules', [...data.lateRules, newRule]);
    } else {
      onFieldChange('earlyRules', [...data.earlyRules, newRule]);
    }
  };

  const handleRemoveRule = (id: string, type: 'TOTAL' | 'LATE' | 'EARLY') => {
    if (type === 'TOTAL') {
      onFieldChange('totalLateEarlyRules', data.totalLateEarlyRules.filter(r => r.id !== id));
    } else if (type === 'LATE') {
      onFieldChange('lateRules', data.lateRules.filter(r => r.id !== id));
    } else {
      onFieldChange('earlyRules', data.earlyRules.filter(r => r.id !== id));
    }
  };

  const handleRuleChange = (id: string, type: 'TOTAL' | 'LATE' | 'EARLY', field: keyof Omit<LateEarlyRule, 'id'>, value: string) => {
    const rules = type === 'TOTAL' ? data.totalLateEarlyRules : type === 'LATE' ? data.lateRules : data.earlyRules;
    const updatedRules = rules.map(r => r.id === id ? { ...r, [field]: value } : r);
    
    if (type === 'TOTAL') {
      onFieldChange('totalLateEarlyRules', updatedRules);
    } else if (type === 'LATE') {
      onFieldChange('lateRules', updatedRules);
    } else {
      onFieldChange('earlyRules', updatedRules);
    }
  };

  const renderRuleBox = (rule: LateEarlyRule, type: 'TOTAL' | 'LATE' | 'EARLY') => (
    <div key={rule.id} className="relative mt-4 rounded-[24px] border border-slate-100 bg-white p-6 pt-10 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <button 
        onClick={() => handleRemoveRule(rule.id, type)}
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
              onChange={(v) => handleRuleChange(rule.id, type, 'startDate', v)}
              className="h-11 flex-1 !rounded-xl !border-none !bg-[#F8FAFC] !px-4 !text-sm !outline-none"
              placeholder="Ngày bắt đầu"
            />
            <span className="text-slate-400">~</span>
            <DatePickerInput
              value={rule.endDate}
              onChange={(v) => handleRuleChange(rule.id, type, 'endDate', v)}
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
            onChange={(e) => handleRuleChange(rule.id, type, 'minutes', e.target.value.replace(/\D/g, ''))}
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
                  onClick={() => {
                    onFieldChange('isTotalLateEarlyEnabled', !data.isTotalLateEarlyEnabled);
                    if (!data.isTotalLateEarlyEnabled) onFieldChange('isSeparateLateEarlyEnabled', false);
                  }}
                  className={`mt-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg transition-all ${
                    data.isTotalLateEarlyEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white ring-1 ring-slate-200 hover:ring-emerald-300'
                  }`}
                >
                  {data.isTotalLateEarlyEnabled && <span className="material-symbols-outlined text-[16px] text-white font-bold">check</span>}
                </div>
                <div className="flex-1">
                  <span className="text-[15px] font-bold text-slate-800">Tổng thời gian đi muộn và về sớm</span>
                  {data.isTotalLateEarlyEnabled && (
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
                      
                      <div className="space-y-4">
                        {data.totalLateEarlyRules.map(r => renderRuleBox(r, 'TOTAL'))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Chế độ 2: Chi tiết từng loại */}
              <div className="flex items-start gap-5">
                <div 
                  onClick={() => {
                    onFieldChange('isSeparateLateEarlyEnabled', !data.isSeparateLateEarlyEnabled);
                    if (!data.isSeparateLateEarlyEnabled) onFieldChange('isTotalLateEarlyEnabled', false);
                  }}
                  className={`mt-1 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg transition-all ${
                    data.isSeparateLateEarlyEnabled ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-white ring-1 ring-slate-200 hover:ring-emerald-300'
                  }`}
                >
                  {data.isSeparateLateEarlyEnabled && <span className="material-symbols-outlined text-[16px] text-white font-bold">check</span>}
                </div>
                <div className="flex-1">
                  <span className="text-[15px] font-bold text-slate-800">Thời gian đi muộn, về sớm</span>
                  {data.isSeparateLateEarlyEnabled && (
                    <div className="mt-8 space-y-10 animate-in fade-in slide-in-from-top-2 duration-300">
                      {/* Đi trễ */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[14px] font-bold text-slate-900">Cho phép đi trễ sau (phút)</label>
                          <p className="text-[12px] leading-relaxed text-slate-400">
                            Thời gian cho phép nhân viên đi muộn.
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
                        
                        <div className="space-y-4">
                          {data.lateRules.map(r => renderRuleBox(r, 'LATE'))}
                        </div>
                      </div>

                      {/* Về sớm */}
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-[14px] font-bold text-slate-900">Cho phép về sớm trước (phút)</label>
                          <p className="text-[12px] leading-relaxed text-slate-400">
                            Thời gian cho phép nhân viên về sớm.
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

                        <div className="space-y-4">
                          {data.earlyRules.map(r => renderRuleBox(r, 'EARLY'))}
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
          <div className="flex items-start gap-10 max-w-[800px]">
            <div 
              onClick={() => onFieldChange('isResigned', !data.isResigned)}
              className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-[10px] transition-all ${
                data.isResigned ? 'bg-emerald-500 shadow-lg shadow-emerald-500/20' : 'bg-[#f1f5f9] ring-1 ring-slate-200 hover:ring-emerald-300'
              }`}
            >
              {data.isResigned && <span className="material-symbols-outlined text-[20px] text-white">check</span>}
            </div>

            {data.isResigned && (
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-[14px] animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700">Lý do nghỉ việc</label>
                  <div className="relative group">
                    {isCreatingReason ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newReasonName}
                          onChange={(e) => setNewReasonName(e.target.value)}
                          className="h-11 flex-1 rounded-xl border border-emerald-200 bg-white px-4 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                          placeholder="Tên lý do mới..."
                          autoFocus
                        />
                        <button 
                          onClick={handleCreateReason}
                          className="h-11 px-4 rounded-xl bg-emerald-500 text-white text-sm font-bold shadow-sm hover:bg-emerald-600 transition-all"
                        >
                          Lưu
                        </button>
                        <button 
                          onClick={() => setIsCreatingReason(false)}
                          className="h-11 px-3 rounded-xl bg-slate-100 text-slate-500 text-sm font-bold hover:bg-slate-200 transition-all"
                        >
                          Hủy
                        </button>
                      </div>
                    ) : (
                      <>
                        <select
                          value={data.resignationReason}
                          onChange={(e) => {
                            if (e.target.value === 'CREATE_NEW') {
                              setIsCreatingReason(true);
                            } else {
                              onFieldChange('resignationReason', e.target.value);
                            }
                          }}
                          className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none transition-all hover:border-emerald-300 focus:ring-2 focus:ring-emerald-500/10 cursor-pointer"
                        >
                          <option value="">Chọn lý do</option>
                          {resignationReasons.map((r) => (
                            <option key={r.id} value={r.reason_name}>{r.reason_name}</option>
                          ))}
                          <option value="CREATE_NEW" className="text-emerald-500 font-bold">+ Tạo mới lý do</option>
                        </select>
                        <span className="material-symbols-outlined pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-slate-500">
                          expand_more
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-slate-700">Ngày làm việc cuối cùng</label>
                  <DatePickerInput
                    value={data.resignationDate}
                    onChange={(v) => onFieldChange('resignationDate', v)}
                    className="h-11"
                  />
                </div>
              </div>
            )}
          </div>
        </FormRow>
      </div>
    </div>
  );
};

export default JobStatusForm;
