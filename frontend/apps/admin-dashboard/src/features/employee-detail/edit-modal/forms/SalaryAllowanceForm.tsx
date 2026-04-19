import React, { useState, useMemo } from 'react';
import type {
  EmployeeEditSalaryAllowancePayload,
} from '../../../../services/employeeService';
import { DatePickerInput, FormHeading } from '../components/FormPrimitives';
import CreateSalaryLevelPopup from './components/CreateSalaryLevelPopup';

interface SalaryAllowanceFormProps {
  data: EmployeeEditSalaryAllowancePayload;
  onFieldChange: <F extends keyof EmployeeEditSalaryAllowancePayload>(
    field: F,
    value: EmployeeEditSalaryAllowancePayload[F],
  ) => void;
}

const PAYMENT_METHODS = [
  'Chi trả một lần',
  'Chi trả theo giờ',
  'Chi trả theo tháng',
  'Chi trả theo ngày công'
];

const SalaryAllowanceForm: React.FC<SalaryAllowanceFormProps> = ({ data, onFieldChange }) => {
  const [salaryLevelOptions, setSalaryLevelOptions] = useState([
    { label: 'Nhân viên', value: 'nhân viên', amount: '10000000' },
    { label: 'Chuyên viên', value: 'chuyên viên', amount: '15000000' },
    { label: 'Trưởng nhóm', value: 'trưởng nhóm', amount: '25000000' },
  ]);

  const [showCreatePopup, setShowCreatePopup] = useState(false);

  const formatCurrency = (val: string | number) => {
    const num = typeof val === 'string' ? Number(val.replace(/\D/g, '')) : val;
    return num.toLocaleString('vi-VN');
  };

  const handleSalaryLevelChange = (value: string, isBase: boolean = true, index?: number) => {
    if (value === '__create_new__') {
      setShowCreatePopup(true);
      return;
    }

    const selected = salaryLevelOptions.find(opt => opt.value === value);
    if (isBase) {
      onFieldChange('salaryLevelName', value);
      if (selected) onFieldChange('salaryAmount', selected.amount);
    } else if (index !== undefined) {
      const next = [...data.salaryChanges];
      next[index] = { ...next[index], salaryLevelName: value };
      if (selected) next[index].amount = selected.amount;
      onFieldChange('salaryChanges', next);
    }
  };

  const handleAddSalaryChange = () => {
    onFieldChange('salaryChanges', [
      ...data.salaryChanges,
      { id: Math.random().toString(36).substr(2, 9), paymentMethod: '', salaryLevelName: '', amount: '0', startDate: '', endDate: '' }
    ]);
  };

  const handleRemoveItem = (field: 'salaryChanges' | 'allowances' | 'otherIncomes', index: number) => {
    onFieldChange(field, (data[field] as any[]).filter((_, i) => i !== index));
  };

  // Validation: Overlap check for AC 2.4
  const hasOverlap = useMemo(() => {
    const sorted = [...data.salaryChanges]
      .filter(s => s.startDate && s.endDate)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
    
    for (let i = 0; i < sorted.length - 1; i++) {
      if (new Date(sorted[i].endDate) > new Date(sorted[i+1].startDate)) return true;
    }
    return false;
  }, [data.salaryChanges]);

  return (
    <div className="space-y-10">
      {/* AC 1.x: Khối Tiền lương cơ bản */}
      <section className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm transition-all hover:shadow-md">
        <FormHeading title="Tiền lương cơ bản" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-2">
            <label className="text-[13px] font-black uppercase tracking-wider text-slate-400 ml-1">Hình thức chi trả</label>
            <select
              value={data.paymentMethod}
              onChange={(e) => onFieldChange('paymentMethod', e.target.value)}
              className="h-14 w-full rounded-[20px] border-2 border-slate-50 bg-slate-50/50 px-6 text-[15px] font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white"
            >
              <option value="">Chọn hình thức</option>
              {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[13px] font-black uppercase tracking-wider text-slate-400 ml-1">Tên bậc lương</label>
            <select
              value={data.salaryLevelName}
              onChange={(e) => handleSalaryLevelChange(e.target.value)}
              className="h-14 w-full rounded-[20px] border-2 border-slate-50 bg-slate-50/50 px-6 text-[15px] font-bold text-slate-700 outline-none transition-all focus:border-emerald-500 focus:bg-white"
            >
              <option value="">Chọn bậc lương</option>
              {salaryLevelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              <option value="__create_new__" className="font-bold text-blue-500">+ Tạo mới bậc lương</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-2">
            <label className="text-[13px] font-black uppercase tracking-wider text-slate-400 ml-1">Mức lương (VND)</label>
            <div className="relative group">
              <input
                type="text"
                value={formatCurrency(data.salaryAmount)}
                onChange={(e) => onFieldChange('salaryAmount', e.target.value.replace(/\D/g, ''))}
                className="h-20 w-full rounded-[24px] border-none bg-emerald-50/30 px-8 text-3xl font-black text-emerald-600 outline-none transition-all focus:bg-emerald-50"
                placeholder="0"
              />
              <span className="absolute right-8 top-1/2 -translate-y-1/2 text-sm font-black text-emerald-400 uppercase tracking-widest">VNĐ</span>
            </div>
          </div>
        </div>
      </section>

      {/* AC 2.x: Khối Tiền lương thay đổi */}
      <section className="rounded-[40px] border border-slate-100 bg-slate-50/30 p-10">
        <div className="mb-10 flex items-center justify-between">
          <FormHeading title="Tiền lương thay đổi" />
          <button
            type="button"
            onClick={handleAddSalaryChange}
            className="text-sm font-black text-emerald-600 underline-offset-4 hover:underline"
          >
            + Tạo mới khối lương
          </button>
        </div>

        {hasOverlap && (
          <div className="mb-6 rounded-2xl bg-rose-50 p-4 text-[13px] font-bold text-rose-500 flex items-center gap-3">
            <span className="material-symbols-outlined">warning</span>
            Có sự trùng lặp hoặc giao nhau về khoảng thời gian giữa các khối lương.
          </div>
        )}

        <div className="space-y-6">
          {data.salaryChanges.map((item, index) => (
            <div key={item.id} className="relative rounded-[32px] border border-slate-100 bg-white p-8 shadow-sm group">
              <button 
                onClick={() => handleRemoveItem('salaryChanges', index)}
                className="absolute right-6 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-slate-50 text-slate-300 transition-all hover:bg-rose-50 hover:text-rose-500 opacity-0 group-hover:opacity-100"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Hình thức chi trả <span className="text-rose-500">*</span></label>
                    <select
                      value={item.paymentMethod}
                      onChange={(e) => {
                        const next = [...data.salaryChanges];
                        next[index].paymentMethod = e.target.value;
                        onFieldChange('salaryChanges', next);
                      }}
                      className="h-12 w-full rounded-[16px] border border-slate-100 bg-slate-50 px-4 text-[13px] font-bold"
                    >
                      <option value="">Chọn hình thức</option>
                      {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Bậc lương <span className="text-rose-500">*</span></label>
                    <select
                      value={item.salaryLevelName}
                      onChange={(e) => handleSalaryLevelChange(e.target.value, false, index)}
                      className="h-12 w-full rounded-[16px] border border-slate-100 bg-slate-50 px-4 text-[13px] font-bold"
                    >
                      <option value="">Chọn bậc lương</option>
                      {salaryLevelOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                 </div>
                 <div className="space-y-1">
                    <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Số tiền</label>
                    <input
                      type="text"
                      readOnly
                      value={formatCurrency(item.amount)}
                      className="h-12 w-full rounded-[16px] border-none bg-slate-50 px-4 text-[13px] font-black text-emerald-600 outline-none"
                    />
                 </div>
                 <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[11px] font-black uppercase text-slate-400 ml-1">Khoảng thời gian <span className="text-rose-500">*</span></label>
                      <div className="flex items-center gap-2">
                        <DatePickerInput
                          value={item.startDate}
                          onChange={(val) => {
                            const next = [...data.salaryChanges];
                            next[index].startDate = val;
                            onFieldChange('salaryChanges', next);
                          }}
                          className="!h-12 !rounded-[16px]"
                        />
                        <span className="text-slate-200">~</span>
                        <DatePickerInput
                          value={item.endDate}
                          onChange={(val) => {
                            const next = [...data.salaryChanges];
                            next[index].endDate = val;
                            onFieldChange('salaryChanges', next);
                          }}
                          className="!h-12 !rounded-[16px]"
                        />
                      </div>
                    </div>
                 </div>
              </div>
            </div>
          ))}
          {data.salaryChanges.length === 0 && (
            <div className="py-10 text-center text-sm font-bold text-slate-300 italic">Chưa có thiết lập lương thay đổi</div>
          )}
        </div>
      </section>

      {/* AC 3.x: Khối Phụ cấp & Thu nhập khác */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Phụ cấp */}
        <section className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm overflow-hidden">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-[4px] rounded-full bg-blue-500"></div>
              <h4 className="text-lg font-black text-slate-800">Phụ cấp</h4>
            </div>
            <button
              onClick={() => onFieldChange('allowances', [...data.allowances, { id: Math.random().toString(36).substr(2, 9), name: '', amount: '0' }])}
              className="text-sm font-black text-blue-600 hover:underline"
            >
              + Tạo mới
            </button>
          </div>
          
          <div className="space-y-4">
            {data.allowances.length === 0 ? (
               <div className="py-10 text-center text-[13px] text-slate-300 italic border-2 border-dashed border-slate-50 rounded-3xl">Trống</div>
            ) : data.allowances.map((item, index) => (
              <div key={item.id} className="relative group p-6 bg-slate-50/50 rounded-[28px] border border-slate-50">
                 <button onClick={() => handleRemoveItem('allowances', index)} className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-white shadow-md text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                 </button>
                 <div className="space-y-4">
                    <select
                      value={item.name}
                      onChange={(e) => {
                        const next = [...data.allowances];
                        next[index].name = e.target.value;
                        onFieldChange('allowances', next);
                      }}
                      className="h-12 w-full rounded-[16px] border-none bg-white px-4 text-[13px] font-bold shadow-sm outline-none"
                    >
                      <option value="">Chọn loại phụ cấp</option>
                      <option value="Phụ cấp ăn trưa">Phụ cấp ăn trưa</option>
                      <option value="Phụ cấp xăng xe">Phụ cấp xăng xe</option>
                      <option value="Phụ cấp điện thoại">Phụ cấp điện thoại</option>
                    </select>
                    <input
                      type="text"
                      value={formatCurrency(item.amount)}
                      onChange={(e) => {
                        const next = [...data.allowances];
                        next[index].amount = e.target.value.replace(/\D/g, '');
                        onFieldChange('allowances', next);
                      }}
                      className="h-12 w-full rounded-[16px] border-none bg-white px-4 text-right font-black text-blue-600 shadow-sm outline-none"
                      placeholder="Số tiền"
                    />
                 </div>
              </div>
            ))}
          </div>
        </section>

        {/* Thu nhập khác */}
        <section className="rounded-[40px] border border-slate-100 bg-white p-10 shadow-sm overflow-hidden">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-6 w-[4px] rounded-full bg-purple-500"></div>
              <h4 className="text-lg font-black text-slate-800">Thu nhập khác</h4>
            </div>
            <button
              onClick={() => onFieldChange('otherIncomes', [...data.otherIncomes, { id: Math.random().toString(36).substr(2, 9), name: '', amount: '0' }])}
              className="text-sm font-black text-purple-600 hover:underline"
            >
              + Tạo mới
            </button>
          </div>
          
          <div className="space-y-4">
            {data.otherIncomes.length === 0 ? (
               <div className="py-10 text-center text-[13px] text-slate-300 italic border-2 border-dashed border-slate-50 rounded-3xl">Trống</div>
            ) : data.otherIncomes.map((item, index) => (
              <div key={item.id} className="relative group p-6 bg-slate-50/50 rounded-[28px] border border-slate-50">
                 <button onClick={() => handleRemoveItem('otherIncomes', index)} className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-white shadow-md text-slate-300 opacity-0 group-hover:opacity-100 hover:text-rose-500 transition-all flex items-center justify-center">
                    <span className="material-symbols-outlined text-[16px]">close</span>
                 </button>
                 <div className="space-y-4">
                    <select
                      value={item.name}
                      onChange={(e) => {
                        const next = [...data.otherIncomes];
                        next[index].name = e.target.value;
                        onFieldChange('otherIncomes', next);
                      }}
                      className="h-12 w-full rounded-[16px] border-none bg-white px-4 text-[13px] font-bold shadow-sm outline-none"
                    >
                      <option value="">Chọn loại thu nhập</option>
                      <option value="Thưởng tháng 13">Thưởng tháng 13</option>
                      <option value="Thưởng KPI">Thưởng KPI</option>
                      <option value="Phúc lợi lễ tết">Phúc lợi lễ tết</option>
                    </select>
                    <input
                      type="text"
                      value={formatCurrency(item.amount)}
                      onChange={(e) => {
                        const next = [...data.otherIncomes];
                        next[index].amount = e.target.value.replace(/\D/g, '');
                        onFieldChange('otherIncomes', next);
                      }}
                      className="h-12 w-full rounded-[16px] border-none bg-white px-4 text-right font-black text-purple-600 shadow-sm outline-none"
                      placeholder="Số tiền"
                    />
                 </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {showCreatePopup && (
        <CreateSalaryLevelPopup 
          onClose={() => setShowCreatePopup(false)}
          onCreated={(newLevel) => {
            setSalaryLevelOptions([...salaryLevelOptions, newLevel]);
            onFieldChange('salaryLevelName', newLevel.value);
            onFieldChange('salaryAmount', newLevel.amount);
          }}
        />
      )}
    </div>
  );
};

export default SalaryAllowanceForm;
