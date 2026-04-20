import React, { useState } from 'react';
import type {
  EmployeeEditInsuranceItemPayload,
  EmployeeEditInsurancePayload,
} from '../../../../services/employeeService';
import EmptyState from '../../components/EmptyState';
import InsuranceCreateModal from './components/InsuranceCreateModal';
import type { EmployeeFullProfile } from '../../../../services/employee/types';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

interface InsuranceFormProps {
  data: EmployeeEditInsurancePayload;
  errors: Record<string, string>;
  profile?: EmployeeFullProfile | null;
  onChange: (value: EmployeeEditInsurancePayload) => void;
}

const InsuranceForm: React.FC<InsuranceFormProps> = ({ data, errors, profile, onChange }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; index?: number; isBulk: boolean }>({
    isOpen: false,
    isBulk: false
  });
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

  const handleRemove = () => {
    if (deleteModal.isBulk) {
       onChange(items.filter((_, idx) => !selectedIndices.has(idx)));
       setSelectedIndices(new Set());
    } else if (deleteModal.index !== undefined) {
       onChange(items.filter((_, idx) => idx !== deleteModal.index));
       const next = new Set(selectedIndices);
       next.delete(deleteModal.index);
       setSelectedIndices(next);
    }
    setDeleteModal({ isOpen: false, isBulk: false });
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === items.length && items.length > 0) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(items.map((_, i) => i)));
    }
  };

  const toggleSelectRow = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const getItemError = (index: number, field: keyof EmployeeEditInsuranceItemPayload): string | undefined =>
    errors[`insurance.${index}.${field}`];

  const showBulkDelete = selectedIndices.size >= 2;

  return (
    <div className="space-y-6">
      {/* Header content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           {showBulkDelete && (
             <button 
               onClick={() => setDeleteModal({ isOpen: true, isBulk: true })}
               className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-[11px] font-bold text-red-500 transition-all hover:bg-red-100"
             >
               <span className="material-symbols-outlined text-[18px]">delete</span>
               Xóa {selectedIndices.size} mục đã chọn
             </button>
           )}
        </div>
        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo mới bảo hiểm
        </button>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 py-5 first:pl-10 w-12 text-center">
                   <button 
                     type="button"
                     onClick={toggleSelectAll}
                     className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all duration-200 
                       ${selectedIndices.size === items.length && items.length > 0
                         ? 'bg-emerald-500 border-emerald-500 text-white' 
                         : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                   >
                     {selectedIndices.size === items.length && items.length > 0 && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                   </button>
                </th>
                <th className="px-4 py-5 text-center font-black text-[11px] uppercase tracking-wider text-slate-400 w-16">STT</th>
                <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Tên nhân viên</th>
                <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Số BHXH</th>
                <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Mã Số BHYT</th>
                <th className="w-14 px-4 py-5 last:pr-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-24">
                    <EmptyState 
                      message="Chưa có thông tin bảo hiểm"
                      icon="health_and_safety"
                      onAdd={handleCreateNew}
                    />
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={index} className={`group transition-all hover:bg-slate-50/50 ${selectedIndices.has(index) ? 'bg-emerald-50/30' : ''}`}>
                    <td className="px-4 py-3 first:pl-10 text-center">
                       <button 
                         type="button"
                         onClick={() => toggleSelectRow(index)}
                         className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all duration-200 
                           ${selectedIndices.has(index) 
                             ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/20' 
                             : 'bg-white border-slate-200 hover:border-emerald-200 group-hover:border-slate-300'}`}
                       >
                         {selectedIndices.has(index) && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                       </button>
                    </td>
                    <td className="px-4 py-3 text-center text-[13px] font-bold text-slate-400">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 min-w-[250px]">
                      <input
                        type="text"
                        value={item.employeeName}
                        onChange={(e) => updateItem(index, { employeeName: e.target.value })}
                        className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-medium text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white"
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[200px]">
                      <input
                        type="text"
                        value={item.socialInsuranceNumber}
                        maxLength={10}
                        onChange={(e) => updateItem(index, { socialInsuranceNumber: e.target.value.replace(/\D/g, '') })}
                        className={`h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-mono font-black text-slate-900 transition-all hover:bg-white hover:border-slate-200 focus:bg-white ${getItemError(index, 'socialInsuranceNumber') ? 'bg-rose-50 text-rose-500' : ''}`}
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[200px]">
                      <input
                        type="text"
                        value={item.healthInsuranceNumber}
                        onChange={(e) => updateItem(index, { healthInsuranceNumber: e.target.value })}
                        className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-mono font-medium text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white"
                      />
                    </td>
                    <td className="px-4 py-3 text-right last:pr-6">
                      <button
                        type="button"
                        onClick={() => setDeleteModal({ isOpen: true, index, isBulk: false })}
                        className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-200 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-50 hover:text-rose-500"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <InsuranceCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onAdd={handleAddItem}
        profile={profile}
        employeeName={profile?.basicInfo?.fullName || ''}
      />

      <ConfirmDeleteModal 
        isOpen={deleteModal.isOpen}
        title={deleteModal.isBulk ? 'Xác nhận xóa nhiều bản ghi' : 'Xác nhận xóa bảo hiểm'}
        message={deleteModal.isBulk 
          ? `Bạn có chắc chắn muốn xóa ${selectedIndices.size} bản ghi đã chọn?` 
          : 'Bạn có chắc chắn muốn xóa bản ghi bảo hiểm này?'}
        onClose={() => setDeleteModal({ isOpen: false, isBulk: false })}
        onConfirm={handleRemove}
      />
    </div>
  );
};

export default InsuranceForm;
