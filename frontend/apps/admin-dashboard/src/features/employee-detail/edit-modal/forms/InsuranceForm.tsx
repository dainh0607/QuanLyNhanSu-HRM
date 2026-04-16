import React from 'react';
import type {
  EmployeeEditInsuranceItemPayload,
  EmployeeEditInsurancePayload,
} from '../../../../services/employeeService';
import EmptyState from '../../components/EmptyState';
import InsuranceCreateModal from './components/InsuranceCreateModal';
import type { EmployeeFullProfile } from '../../../../services/employee/types';

interface InsuranceFormProps {
  data: EmployeeEditInsurancePayload;
  errors: Record<string, string>;
  profile?: EmployeeFullProfile | null;
  onChange: (value: EmployeeEditInsurancePayload) => void;
}

const InsuranceForm: React.FC<InsuranceFormProps> = ({ data, errors, profile, onChange }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const items = data;

  const updateItem = (index: number, patch: Partial<EmployeeEditInsuranceItemPayload>) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...patch };
    onChange(updatedItems);
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
  };

  const handleAddItem = (newItem: EmployeeEditInsuranceItemPayload) => {
    onChange([...items, newItem]);
  };

  const handleRemove = (index: number) => {
    onChange(items.filter((_, itemIndex) => itemIndex !== index));
  };

  const getItemError = (index: number, field: keyof EmployeeEditInsuranceItemPayload): string | undefined =>
    errors[`insurance.${index}.${field}`];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex items-center gap-4 border-l-[6px] border-emerald-500 py-1 pl-4">
        <h2 className="text-xl font-black tracking-tight text-slate-900">Bảo hiểm</h2>
      </div>

      {/* Main List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-800">Thông tin bảo hiểm</h3>
          <button
            type="button"
            onClick={handleCreateNew}
            className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 hover:shadow-emerald-500/40 active:scale-95"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tạo mới
          </button>
        </div>

        <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5 transition-all">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="w-16 px-4 py-5 font-black text-[11px] uppercase tracking-wider text-slate-400 text-center">STT</th>
                  <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Tên nhân viên</th>
                  <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Mã số BHXH</th>
                  <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Số thẻ bảo hiểm y tế</th>
                  <th className="w-14 px-4 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20">
                      <EmptyState 
                        message="Trống"
                        icon="health_and_safety"
                        onAdd={handleCreateNew}
                      />
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={index} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-4 py-4 text-center text-xs font-bold text-slate-400">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 min-w-[250px]">
                        <input
                          type="text"
                          value={item.employeeName}
                          onChange={(e) => updateItem(index, { employeeName: e.target.value })}
                          placeholder="Họ và tên nhân viên"
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-medium text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500"
                        />
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.socialInsuranceNumber}
                            onChange={(e) => updateItem(index, { socialInsuranceNumber: e.target.value.replace(/\D/g, '') })}
                            placeholder="10 chữ số BHXH"
                            maxLength={10}
                            className={`h-10 w-full rounded-xl border-transparent bg-transparent pl-3 pr-10 text-[13px] font-bold font-mono text-slate-900 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 ${getItemError(index, 'socialInsuranceNumber') ? 'border-rose-300 bg-rose-50/50' : ''}`}
                          />
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-300 pointer-events-none">pin</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 min-w-[200px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.healthInsuranceNumber}
                            onChange={(e) => updateItem(index, { healthInsuranceNumber: e.target.value })}
                            placeholder="Mã số thẻ BHYT"
                            className="h-10 w-full rounded-xl border-transparent bg-transparent pl-3 pr-10 text-[13px] font-medium font-mono text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500"
                          />
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-slate-300 pointer-events-none">credit_card</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-300 opacity-0 transition-all hover:bg-rose-50 hover:text-rose-500 focus:opacity-100 group-hover:opacity-100"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <InsuranceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAdd={handleAddItem}
        employeeName={profile?.basicInfo?.fullName || ''}
      />
    </div>
  );
};

export default InsuranceForm;
