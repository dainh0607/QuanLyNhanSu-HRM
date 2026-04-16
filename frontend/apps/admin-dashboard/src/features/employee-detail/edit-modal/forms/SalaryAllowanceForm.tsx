import React from 'react';
import type {
  EmployeeEditSalaryAllowancePayload,
} from '../../../../services/employeeService';
import { FormHeading, FormRow } from '../components/FormPrimitives';
import { getFieldClassName } from '../formStyles';
import SearchableSelect from '../../../employees-contracts/components/Shared/SearchableSelect';
import type { SelectOption } from '../../../employees-contracts/types';

interface SalaryAllowanceFormProps {
  data: EmployeeEditSalaryAllowancePayload;
  onFieldChange: <F extends keyof EmployeeEditSalaryAllowancePayload>(
    field: F,
    value: EmployeeEditSalaryAllowancePayload[F],
  ) => void;
}

const SalaryAllowanceForm: React.FC<SalaryAllowanceFormProps> = ({ data, onFieldChange }) => {
  
  const salaryLevelOptions: SelectOption[] = [
    { label: 'Nhân viên', value: 'nhân viên' },
    { label: 'Chuyên viên', value: 'chuyên viên' },
    { label: 'Trưởng nhóm', value: 'trưởng nhóm' },
  ];

  const allowanceOptions: SelectOption[] = [
    { label: 'Phụ cấp ăn trưa', value: 'Phụ cấp ăn trưa' },
    { label: 'Phụ cấp xăng xe', value: 'Phụ cấp xăng xe' },
    { label: 'Phụ cấp điện thoại', value: 'Phụ cấp điện thoại' },
  ];

  const otherIncomeOptions: SelectOption[] = [
    { label: 'Thưởng quý', value: 'Thưởng quý' },
    { label: 'Thưởng lễ tết', value: 'Thưởng lễ tết' },
    { label: 'Thưởng hiệu quả', value: 'Thưởng hiệu quả' },
  ];

  const handleCreateNew = (type: string) => {
    // Placeholder cho hành động tạo mới thực tế
    alert(`Mở form tạo mới ${type}`);
  };

  // Tự động thêm một mục trống mặc định nếu danh sách đang rỗng
  React.useEffect(() => {
    if (data.allowances.length === 0) {
      onFieldChange('allowances', [{ id: Math.random().toString(36).substr(2, 9), name: '', amount: '0' }]);
    }
  }, [data.allowances.length, onFieldChange]);

  React.useEffect(() => {
    if (data.otherIncomes.length === 0) {
      onFieldChange('otherIncomes', [{ id: Math.random().toString(36).substr(2, 9), name: '', amount: '0' }]);
    }
  }, [data.otherIncomes.length, onFieldChange]);

  const handleAddSalaryChange = () => {
    onFieldChange('salaryChanges', [
      ...data.salaryChanges,
      { id: Math.random().toString(36).substr(2, 9), paymentMethod: '', amount: '0', salaryLevelName: '', duration: '' }
    ]);
  };

  const handleAddAllowance = () => {
    onFieldChange('allowances', [
      ...data.allowances,
      { id: Math.random().toString(36).substr(2, 9), name: '', amount: '0' }
    ]);
  };

  const handleAddOtherIncome = () => {
    onFieldChange('otherIncomes', [
      ...data.otherIncomes,
      { id: Math.random().toString(36).substr(2, 9), name: '', amount: '0' }
    ]);
  };

  const handleRemoveItem = (field: 'salaryChanges' | 'allowances' | 'otherIncomes', id: string) => {
    onFieldChange(field, (data[field] as any[]).filter(item => item.id !== id));
  };

  return (
    <>
      <FormHeading
        title="Tiền lương & Trợ cấp"
        description="Quản lý chi tiết về lương, các khoản phụ cấp và lịch sử thay đổi thu nhập của nhân viên."
      />

      <div className="space-y-12">
        {/* Main Salary Section */}
        <section className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <div className="mb-10 flex items-center gap-4">
            <div className="h-8 w-1.5 rounded-full bg-emerald-500"></div>
            <h3 className="text-xl font-black text-slate-900">Tiền lương</h3>
          </div>

          <div className="divide-y divide-slate-100">
            <FormRow 
              label="Hình thức chi trả" 
              description="Bạn chi trả nhân viên theo hình thức nào theo giờ, theo tháng, theo sản phẩm, theo doanh thu..."
            >
              <select
                value={data.paymentMethod}
                onChange={(e) => onFieldChange('paymentMethod', e.target.value)}
                className={getFieldClassName(false)}
              >
                <option value="">Chọn hình thức</option>
                <option value="Chi trả theo giờ">Chi trả theo giờ</option>
                <option value="Chi trả theo tháng">Chi trả theo tháng</option>
                <option value="Chi trả theo sản phẩm">Chi trả theo sản phẩm</option>
                <option value="Chi trả theo doanh thu">Chi trả theo doanh thu</option>
              </select>
            </FormRow>

            <FormRow 
              label="Tên bậc lương" 
              description="Tên bậc lương mà bạn chi trả trong công ty"
            >
              <SearchableSelect
                value={data.salaryLevelName}
                options={salaryLevelOptions}
                placeholder="Theo cấp bậc"
                onChange={(val) => onFieldChange('salaryLevelName', val)}
                footerAction={{
                  label: 'Tạo mới',
                  onClick: () => handleCreateNew('Bậc lương')
                }}
              />
            </FormRow>

            <FormRow label="Mức lương">
              <div className="relative group max-w-md">
                <input
                  type="text"
                  value={Number(data.salaryAmount || 0).toLocaleString('vi-VN')}
                  onChange={(e) => onFieldChange('salaryAmount', e.target.value.replace(/\D/g, ''))}
                  className="h-14 w-full rounded-2xl border-none bg-[#EDF2F9] px-6 text-lg font-black text-slate-700 outline-none transition-all focus:ring-4 focus:ring-blue-100"
                  placeholder="0"
                />
              </div>
            </FormRow>
          </div>
        </section>

        {/* Salary Changes */}
        <section className="space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-6 w-1 rounded-full bg-emerald-500"></div>
              <h4 className="text-[17px] font-bold text-slate-800 uppercase tracking-tight">Tiền lương thay đổi</h4>
            </div>
            <button
              onClick={handleAddSalaryChange}
              className="text-emerald-500 text-sm font-bold hover:text-emerald-600 transition-colors"
            >
              Tạo mới
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {data.salaryChanges.map((item) => (
              <div key={item.id} className="relative rounded-[32px] border border-slate-100 bg-[#F8FAFC] p-8 pt-12 shadow-sm transition-all hover:shadow-md">
                <button 
                  onClick={() => handleRemoveItem('salaryChanges', item.id!)}
                  className="absolute right-6 top-6 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-300 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-500"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>

                <div className="divide-y divide-slate-100/50">
                  {/* Hình thức chi trả */}
                  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-6 first:pt-0">
                    <div className="space-y-1">
                      <label className="text-[14px] font-bold text-slate-900">Hình thức chi trả</label>
                      <p className="text-[12px] leading-relaxed text-slate-400">
                        Bạn chi trả nhân viên theo hình thức nào theo giờ, theo tháng, theo sản phẩm, theo doanh thu...
                      </p>
                    </div>
                    <select 
                      value={item.paymentMethod} 
                      className="h-11 w-full rounded-xl border-none bg-white px-4 text-sm text-slate-700 outline-none shadow-sm focus:ring-2 focus:ring-emerald-500/20"
                      onChange={(e) => {
                        onFieldChange('salaryChanges', data.salaryChanges.map(s => s.id === item.id ? { ...s, paymentMethod: e.target.value } : s));
                      }} 
                    >
                      <option value="">Chọn hình thức</option>
                      <option value="Chi trả theo giờ">Chi trả theo giờ</option>
                      <option value="Chi trả theo tháng">Chi trả theo tháng</option>
                    </select>
                  </div>

                  {/* Khoảng thời gian */}
                  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-6">
                    <div className="space-y-1">
                      <label className="text-[14px] font-bold text-slate-900">
                        Khoảng thời gian <span className="text-rose-500">*</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input 
                        type="date" 
                        className="h-11 flex-1 rounded-xl border-none bg-white px-4 text-sm text-slate-700 outline-none shadow-sm"
                        onChange={(e) => {
                          const start = e.target.value;
                          const currentRange = item.duration.split(' ~ ');
                          onFieldChange('salaryChanges', data.salaryChanges.map(s => s.id === item.id ? { ...s, duration: `${start} ~ ${currentRange[1] || ''}` } : s));
                        }}
                      />
                      <span className="text-slate-400">~</span>
                      <input 
                        type="date" 
                        className="h-11 flex-1 rounded-xl border-none bg-white px-4 text-sm text-slate-700 outline-none shadow-sm"
                        onChange={(e) => {
                          const end = e.target.value;
                          const currentRange = item.duration.split(' ~ ');
                          onFieldChange('salaryChanges', data.salaryChanges.map(s => s.id === item.id ? { ...s, duration: `${currentRange[0] || ''} ~ ${end}` } : s));
                        }}
                      />
                    </div>
                  </div>

                  {/* Tên bậc lương */}
                  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-6">
                    <div className="space-y-1">
                      <label className="text-[14px] font-bold text-slate-900">
                        Tên bậc lương <span className="text-rose-500">*</span>
                      </label>
                      <p className="text-[12px] leading-relaxed text-slate-400">
                        Tên bậc lương mà bạn chi trả trong công ty
                      </p>
                    </div>
                    <SearchableSelect
                      value={item.salaryLevelName}
                      options={salaryLevelOptions}
                      placeholder="Theo cấp bậc"
                      onChange={(val) => {
                        onFieldChange('salaryChanges', data.salaryChanges.map(s => s.id === item.id ? { ...s, salaryLevelName: val } : s));
                      }}
                      footerAction={{
                        label: 'Tạo mới',
                        onClick: () => handleCreateNew('Bậc lương')
                      }}
                    />
                  </div>

                  {/* Mức lương */}
                  <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 py-6 last:pb-0">
                    <div className="space-y-1">
                      <label className="text-[14px] font-bold text-slate-900">Mức lương</label>
                    </div>
                    <input 
                      type="text" 
                      value={Number(item.amount || 0).toLocaleString('vi-VN')} 
                      className="h-12 w-full max-w-[240px] rounded-2xl border-none bg-[#EDF2F9] px-4 text-[15px] font-black text-slate-700 outline-none" 
                      onChange={(e) => {
                        onFieldChange('salaryChanges', data.salaryChanges.map(s => s.id === item.id ? { ...s, amount: e.target.value.replace(/\D/g, '') } : s));
                      }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Allowances & Other Incomes */}
        {/* Allowances & Other Incomes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Phụ cấp */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-emerald-500"></div>
                <h4 className="text-[17px] font-bold text-slate-800">Phụ cấp</h4>
              </div>
              <button
                onClick={handleAddAllowance}
                className="text-emerald-500 text-sm font-bold hover:text-emerald-600 transition-colors"
              >
                Tạo mới
              </button>
            </div>
            
            <div className="space-y-4">
              {data.allowances.map((item) => (
                <div key={item.id} className="relative rounded-[24px] border border-slate-100 bg-[#F8FAFC] p-6 pt-10">
                  <button 
                    onClick={() => handleRemoveItem('allowances', item.id!)}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-500"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>

                  <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                      <label className="text-sm font-bold text-slate-600">Tên phụ cấp</label>
                      <SearchableSelect
                        value={item.name}
                        options={allowanceOptions}
                        placeholder="Tên phụ cấp"
                        onChange={(val) => {
                          onFieldChange('allowances', data.allowances.map(a => a.id === item.id ? { ...a, name: val } : a));
                        }}
                        footerAction={{
                          label: 'Tạo mới',
                          onClick: () => handleCreateNew('Phụ cấp')
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                      <div className="space-y-0.5">
                        <label className="text-sm font-bold text-slate-600 font-bold">Số tiền</label>
                        <p className="text-[10px] text-slate-400 font-bold">(VND)</p>
                      </div>
                      <input 
                        type="text" 
                        value={Number(item.amount || 0).toLocaleString('vi-VN')} 
                        className="h-11 w-full rounded-xl border-none bg-[#EDF2F9] px-4 text-right text-sm font-black text-slate-700 outline-none" 
                        onChange={(e) => {
                          onFieldChange('allowances', data.allowances.map(a => a.id === item.id ? { ...a, amount: e.target.value.replace(/\D/g, '') } : a));
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Thu nhập khác */}
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-6 w-1 rounded-full bg-emerald-500"></div>
                <h4 className="text-[17px] font-bold text-slate-800">Thu nhập khác</h4>
              </div>
              <button
                onClick={handleAddOtherIncome}
                className="text-emerald-500 text-sm font-bold hover:text-emerald-600 transition-colors"
              >
                Tạo mới
              </button>
            </div>
            
            <div className="space-y-4">
              {data.otherIncomes.map((item) => (
                <div key={item.id} className="relative rounded-[24px] border border-slate-100 bg-[#F8FAFC] p-6 pt-10">
                  <button 
                    onClick={() => handleRemoveItem('otherIncomes', item.id!)}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm transition-all hover:bg-rose-50 hover:text-rose-500"
                  >
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>

                  <div className="space-y-4">
                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                      <label className="text-sm font-bold text-slate-600">Tên thu nhập</label>
                      <SearchableSelect
                        value={item.name}
                        options={otherIncomeOptions}
                        placeholder="Tên thu nhập"
                        onChange={(val) => {
                          onFieldChange('otherIncomes', data.otherIncomes.map(o => o.id === item.id ? { ...o, name: val } : o));
                        }}
                        footerAction={{
                          label: 'Tạo mới',
                          onClick: () => handleCreateNew('Thu nhập')
                        }}
                      />
                    </div>

                    <div className="grid grid-cols-[1fr_2fr] items-center gap-4">
                      <div className="space-y-0.5">
                        <label className="text-sm font-bold text-slate-600 font-bold">Số tiền</label>
                        <p className="text-[10px] text-slate-400 font-bold">(VND)</p>
                      </div>
                      <input 
                        type="text" 
                        value={Number(item.amount || 0).toLocaleString('vi-VN')} 
                        className="h-11 w-full rounded-xl border-none bg-[#EDF2F9] px-4 text-right text-sm font-black text-slate-700 outline-none" 
                        onChange={(e) => {
                          onFieldChange('otherIncomes', data.otherIncomes.map(o => o.id === item.id ? { ...o, amount: e.target.value.replace(/\D/g, '') } : o));
                        }} 
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </>
  );
};

export default SalaryAllowanceForm;
