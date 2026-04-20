import React, { useState } from 'react';
import type {
  EmployeeEditContractItemPayload,
  EmployeeEditContractPayload,
} from '../../../../services/employeeService';
import { DatePickerInput, FormHeading } from '../components/FormPrimitives';
import EmptyState from '../../components/EmptyState';
import RegularContractModal from '../../../employees-contracts/components/Shared/RegularContractModal';
import { contractsService } from '../../../employees-contracts/services/contractsService';
import type { Employee } from '../../../employees/types';
import { useToast } from '../../../../hooks/useToast';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

interface ContractFormProps {
  employeeId?: number;
  data: EmployeeEditContractPayload;
  errors: Record<string, string>;
  onRefresh: () => void;
  onChange: (value: EmployeeEditContractPayload) => void;
}

const ContractForm: React.FC<ContractFormProps> = ({ 
  employeeId, 
  data, 
  errors, 
  onRefresh, 
  onChange 
}) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [directory, setDirectory] = useState<Employee[]>([]);
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; index?: number; isBulk: boolean }>({
    isOpen: false,
    isBulk: false
  });
  const { showToast } = useToast();
  const items = data;

  React.useEffect(() => {
    const fetchDirectory = async () => {
      try {
        const employees = await contractsService.fetchAllEmployees();
        setDirectory(employees);
      } catch (err) {
        console.error('Fetch directory error:', err);
      }
    };
    fetchDirectory();
  }, []);

  const employeeOptions = React.useMemo(() => contractsService.createEmployeeOptions(directory), [directory]);
  const signerOptions = React.useMemo(() => contractsService.createSignerOptions(directory), [directory]);

  const updateItem = (index: number, patch: Partial<EmployeeEditContractItemPayload>) => {
    const updatedItems = [...items];
    updatedItems[index] = { ...updatedItems[index], ...patch };
    onChange(updatedItems);
  };

  const handleCreateNew = () => {
    setIsCreateModalOpen(true);
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

  const getItemError = (index: number, field: keyof EmployeeEditContractItemPayload): string | undefined =>
    errors[`contract.${index}.${field}`];

  const showBulkDelete = selectedIndices.size >= 2;

  return (
    <div className="space-y-6">
      {/* AC 1.1: Tiêu đề tab */}
      <FormHeading title="Danh sách hợp đồng" />

      {/* Header Tools */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           {showBulkDelete && (
             <button 
               onClick={() => setDeleteModal({ isOpen: true, isBulk: true })}
               className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-[11px] font-bold text-red-500 transition-all hover:bg-red-100"
             >
               <span className="material-symbols-outlined text-[18px]">delete</span>
               Xóa {selectedIndices.size} hợp đồng đã chọn
             </button>
           )}
        </div>
        <button
          type="button"
          onClick={handleCreateNew}
          className="flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-600 active:scale-95"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Tạo mới hợp đồng
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
                <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Họ và tên</th>
                <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Số HĐ</th>
                <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Loại hợp đồng</th>
                <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Ngày ký</th>
                <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Ngày hết hạn</th>
                <th className="px-4 py-5 text-left font-black text-[11px] uppercase tracking-wider text-slate-400">Trạng thái</th>
                <th className="w-14 px-4 py-5 last:pr-6"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-24">
                    <EmptyState 
                      message="Không có hợp đồng nào"
                      icon="description"
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
                    <td className="px-4 py-3 min-w-[180px]">
                      <input
                        type="text"
                        value={item.employeeName}
                        onChange={(e) => updateItem(index, { employeeName: e.target.value })}
                        className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-medium text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:border-emerald-500"
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[150px]">
                      <input
                        type="text"
                        value={item.documentNumber}
                        onChange={(e) => updateItem(index, { documentNumber: e.target.value })}
                        className={`h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-mono font-black text-slate-900 transition-all hover:bg-white hover:border-slate-200 focus:bg-white focus:border-emerald-500 ${getItemError(index, 'documentNumber') ? 'bg-rose-50 text-rose-500' : ''}`}
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[180px]">
                       <input
                        type="text"
                        value={item.contractType}
                        onChange={(e) => updateItem(index, { contractType: e.target.value })}
                        className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-medium text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white"
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <DatePickerInput
                        value={item.signDate}
                        onChange={(val) => updateItem(index, { signDate: val })}
                        className="!h-10 !rounded-xl !border-transparent !bg-transparent hover:!bg-white hover:!border-slate-200 focus:!bg-white focus:!border-emerald-500 !text-[13px]"
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[160px]">
                      <DatePickerInput
                        value={item.expiryDate}
                        onChange={(val) => updateItem(index, { expiryDate: val })}
                        className="!h-10 !rounded-xl !border-transparent !bg-transparent hover:!bg-white hover:!border-slate-200 focus:!bg-white focus:!border-emerald-500 !text-[13px]"
                      />
                    </td>
                    <td className="px-4 py-3 min-w-[150px]">
                      <div className="relative">
                        <select
                          value={item.status}
                          onChange={(e) => updateItem(index, { status: e.target.value })}
                          className="h-10 w-full appearance-none rounded-xl border-transparent bg-transparent pl-3 pr-8 text-[12px] font-bold text-slate-600 transition-all hover:bg-white hover:border-slate-200 focus:bg-white outline-none"
                        >
                          <option value="Đang hiệu lực">Đang hiệu lực</option>
                          <option value="Đã hết hạn">Đã hết hạn</option>
                          <option value="Đã thanh lý">Đã thanh lý</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[18px] pointer-events-none text-slate-400">expand_more</span>
                      </div>
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

      <RegularContractModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        employees={directory}
        employeeOptions={employeeOptions}
        signerOptions={signerOptions}
        existingContracts={[]}
        onCreated={async () => {
          await onRefresh();
          setIsCreateModalOpen(false);
        }}
        onNavigateToEmployeeProfile={() => {}}
        showToast={showToast}
        preselectedEmployeeId={String(employeeId || '')}
        isEmployeeSelectionDisabled={true}
      />

      <ConfirmDeleteModal 
        isOpen={deleteModal.isOpen}
        title={deleteModal.isBulk ? 'Xác nhận xóa nhiều hợp đồng' : 'Xác nhận xóa hợp đồng'}
        message={deleteModal.isBulk 
          ? `Bạn có chắc chắn muốn xóa ${selectedIndices.size} hợp đồng đã chọn?` 
          : 'Bạn có chắc chắn muốn xóa hợp đồng này?'}
        onClose={() => setDeleteModal({ isOpen: false, isBulk: false })}
        onConfirm={handleRemove}
      />
    </div>
  );
};

export default ContractForm;
