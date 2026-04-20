import React, { useState, useMemo } from 'react';
import type {
  EmployeeEditPromotionHistoryItemPayload,
  EmployeeEditPromotionHistoryPayload,
} from '../../../../services/employeeService';
import { DatePickerInput } from '../components/FormPrimitives';
import EmptyState from '../../components/EmptyState';
import ConfirmDeleteModal from '../../components/ConfirmDeleteModal';

interface PromotionHistoryFormProps {
  data: EmployeeEditPromotionHistoryPayload;
  errors: Record<string, string>;
  onChange: (value: EmployeeEditPromotionHistoryPayload) => void;
}

const createEmptyPromotionItem = (): EmployeeEditPromotionHistoryItemPayload => ({
  id: undefined,
  effectiveDate: '',
  decisionType: '',
  contractType: '',
  documentNumber: '',
  jobStatus: '',
  city: '',
  district: '',
  branch: '',
  department: '',
  jobTitle: '',
  paymentMethod: '',
  salaryLevelName: '',
  salaryAmount: '',
  allowance: '',
  otherIncome: '',
  note: '',
});

const isItemEmpty = (item: EmployeeEditPromotionHistoryItemPayload): boolean => {
  const { id, ...rest } = item;
  return Object.values(rest).every(val => val === '' || val === undefined);
};

const PROMOTION_COLUMNS = [
  { id: 'effectiveDate', label: 'Ngày có hiệu lực' },
  { id: 'decisionType', label: 'Loại quyết định' },
  { id: 'contractType', label: 'Loại HĐ/PLHĐ' },
  { id: 'documentNumber', label: 'Số QĐ/HĐ' },
  { id: 'jobStatus', label: 'Tình trạng công việc' },
  { id: 'city', label: 'Tỉnh/Thành phố' },
  { id: 'district', label: 'Quận/Huyện' },
  { id: 'branch', label: 'Chi nhánh' },
  { id: 'department', label: 'Phòng ban' },
  { id: 'jobTitle', label: 'Chức danh' },
  { id: 'paymentMethod', label: 'Hình thức chi trả' },
  { id: 'salaryLevelName', label: 'Tên bậc lương' },
  { id: 'salaryAmount', label: 'Mức lương' },
  { id: 'allowance', label: 'Phụ cấp' },
  { id: 'otherIncome', label: 'Thu nhập khác' },
  { id: 'note', label: 'Ghi chú' },
];

const PromotionHistoryForm: React.FC<PromotionHistoryFormProps> = ({ data, errors, onChange }) => {
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false);
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>([
    'effectiveDate', 'decisionType', 'documentNumber', 'jobTitle', 'salaryAmount', 'branch', 'department'
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndices, setSelectedIndices] = useState<Set<number>>(new Set());
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; index?: number; isBulk: boolean }>({
    isOpen: false,
    isBulk: false
  });

  const filteredData = useMemo(() => {
    if (!searchTerm) return data.map((item, index) => ({ item, index }));
    const term = searchTerm.toLowerCase();
    return data
      .map((item, index) => ({ item, index }))
      .filter(entry => 
        entry.item.documentNumber?.toLowerCase().includes(term) || 
        entry.item.jobTitle?.toLowerCase().includes(term) ||
        entry.item.decisionType?.toLowerCase().includes(term)
      );
  }, [data, searchTerm]);

  const updateItem = (index: number, patch: Partial<EmployeeEditPromotionHistoryItemPayload>) => {
    const updatedItems = [...data];
    updatedItems[index] = { ...updatedItems[index], ...patch };

    const lastItem = updatedItems[updatedItems.length - 1];
    if (lastItem && !isItemEmpty(lastItem)) {
      updatedItems.push(createEmptyPromotionItem());
    }

    onChange(updatedItems);
  };

  const handleRemove = () => {
    if (deleteModal.isBulk) {
       const filtered = data.filter((_, idx) => !selectedIndices.has(idx));
       onChange(filtered);
       setSelectedIndices(new Set());
    } else if (deleteModal.index !== undefined) {
       const filtered = data.filter((_, idx) => idx !== deleteModal.index);
       onChange(filtered);
       const next = new Set(selectedIndices);
       next.delete(deleteModal.index);
       setSelectedIndices(next);
    }
    setDeleteModal({ isOpen: false, isBulk: false });
  };

  const toggleSelectAll = () => {
    if (selectedIndices.size === data.length && data.length > 0) {
      setSelectedIndices(new Set());
    } else {
      setSelectedIndices(new Set(data.map((_, i) => i)));
    }
  };

  const toggleSelectRow = (index: number) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  const getItemError = (index: number, field: keyof EmployeeEditPromotionHistoryItemPayload): string | undefined =>
    errors[`promotionHistory.${index}.${field}`];

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  const showBulkDelete = selectedIndices.size >= 2;

  return (
    <div className="relative space-y-6">
      {/* Settings Modal */}
      {isSettingsOpen && (
        <>
          <div className="fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-[2px]" onClick={() => setIsSettingsOpen(false)} />
          <div className="fixed right-0 top-0 z-[70] h-full w-[360px] border-l border-slate-200 bg-white shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-lg font-black text-slate-900">Tùy chỉnh cột</h3>
                <button onClick={() => setIsSettingsOpen(false)} className="rounded-full p-2 text-slate-400 hover:bg-slate-50">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                {PROMOTION_COLUMNS.map((col) => (
                  <div key={col.id} className="flex items-center justify-between rounded-xl bg-slate-50/50 p-4 transition-colors hover:bg-slate-50">
                    <span className="text-sm font-medium text-slate-700">{col.label}</span>
                    <button onClick={() => toggleColumn(col.id)} className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors ${visibleColumns.includes(col.id) ? 'bg-emerald-500' : 'bg-slate-200'}`}>
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${visibleColumns.includes(col.id) ? 'translate-x-5.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Header Content */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[18px] group-hover:text-emerald-500 transition-colors">search</span>
              <input 
                type="text"
                placeholder="Tìm nội dung chỉnh sửa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-64 rounded-xl bg-slate-100/50 pl-10 pr-4 text-[12px] font-medium text-slate-600 outline-none border border-transparent focus:border-emerald-200 focus:bg-white transition-all"
              />
           </div>
           
           {showBulkDelete && (
             <button 
               onClick={() => setDeleteModal({ isOpen: true, isBulk: true })}
               className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-[11px] font-bold text-red-500 transition-all hover:bg-red-100 animate-in fade-in slide-in-from-left-2"
             >
               <span className="material-symbols-outlined text-[18px]">delete</span>
               Xóa {selectedIndices.size} mục đã chọn
             </button>
           )}
        </div>
        <div className="flex items-center gap-3">
           <button 
             onClick={() => setIsSettingsOpen(true)}
             className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/50 text-slate-400 hover:bg-slate-100 hover:text-slate-900 transition-all"
           >
             <span className="material-symbols-outlined text-[20px]">menu</span>
           </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 py-5 first:pl-10 w-12 text-center">
                   <button 
                     type="button"
                     onClick={toggleSelectAll}
                     className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all duration-200 
                       ${selectedIndices.size === data.length && data.length > 0
                         ? 'bg-emerald-500 border-emerald-500 text-white' 
                         : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                   >
                     {selectedIndices.size === data.length && data.length > 0 && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                   </button>
                </th>
                {PROMOTION_COLUMNS.filter(c => visibleColumns.includes(c.id)).map((col) => (
                  <th key={col.id} className="whitespace-nowrap px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-5 last:pr-6 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-24">
                    <EmptyState 
                      message={searchTerm ? "Không tìm thấy dữ liệu khớp" : "Không có dữ liệu"}
                      onAdd={searchTerm ? undefined : () => onChange([createEmptyPromotionItem()])}
                    />
                  </td>
                </tr>
              ) : (
                filteredData.map(({ item, index }) => (
                  <tr key={index} className={`hover:bg-slate-50/30 transition-all group ${selectedIndices.has(index) ? 'bg-emerald-50/30' : ''}`}>
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
                    
                    {visibleColumns.includes('effectiveDate') && (
                      <td className="px-4 py-2 min-w-[200px]">
                        <DatePickerInput
                          value={item.effectiveDate}
                          hasError={Boolean(getItemError(index, 'effectiveDate'))}
                          onChange={(val) => updateItem(index, { effectiveDate: val })}
                          className="!h-10 !rounded-xl !border-transparent !bg-transparent hover:!bg-white hover:!border-slate-200 focus:!bg-white focus:!border-emerald-500 !text-[13px]"
                        />
                      </td>
                    )}
                    
                    {/* Other Inputs */}
                    {visibleColumns.includes('decisionType') && (
                      <td className="px-4 py-2 min-w-[220px]">
                        <input
                          type="text"
                          value={item.decisionType || ''}
                          onChange={(e) => updateItem(index, { decisionType: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all font-medium"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('contractType') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.contractType || ''}
                          onChange={(e) => updateItem(index, { contractType: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('documentNumber') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.documentNumber || ''}
                          onChange={(e) => updateItem(index, { documentNumber: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-mono font-black text-slate-900 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all uppercase tracking-tighter"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('jobStatus') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.jobStatus || ''}
                          onChange={(e) => updateItem(index, { jobStatus: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('city') && (
                      <td className="px-4 py-2 min-w-[150px]">
                        <input
                          type="text"
                          value={item.city || ''}
                          onChange={(e) => updateItem(index, { city: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('district') && (
                      <td className="px-4 py-2 min-w-[150px]">
                        <input
                          type="text"
                          value={item.district || ''}
                          onChange={(e) => updateItem(index, { district: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('branch') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.branch || ''}
                          onChange={(e) => updateItem(index, { branch: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('department') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.department || ''}
                          onChange={(e) => updateItem(index, { department: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('jobTitle') && (
                      <td className="px-4 py-2 min-w-[200px]">
                        <input
                          type="text"
                          value={item.jobTitle || ''}
                          onChange={(e) => updateItem(index, { jobTitle: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-black text-slate-900 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('paymentMethod') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.paymentMethod || ''}
                          onChange={(e) => updateItem(index, { paymentMethod: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('salaryLevelName') && (
                      <td className="px-4 py-2 min-w-[150px]">
                        <input
                          type="text"
                          value={item.salaryLevelName || ''}
                          onChange={(e) => updateItem(index, { salaryLevelName: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('salaryAmount') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.salaryAmount}
                            onChange={(e) => updateItem(index, { salaryAmount: e.target.value.replace(/\D/g, '') })}
                            className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 pr-10 text-[13px] font-black text-emerald-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:border-emerald-500 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">VNĐ</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('allowance') && (
                      <td className="px-4 py-2 min-w-[150px]">
                        <input
                          type="text"
                          value={item.allowance}
                          onChange={(e) => updateItem(index, { allowance: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-emerald-600 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('otherIncome') && (
                      <td className="px-4 py-2 min-w-[150px]">
                        <input
                          type="text"
                          value={item.otherIncome}
                          onChange={(e) => updateItem(index, { otherIncome: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-emerald-600 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('note') && (
                      <td className="px-4 py-2 min-w-[300px]">
                        <input
                          type="text"
                          value={item.note || ''}
                          onChange={(e) => updateItem(index, { note: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-500 hover:bg-white hover:border-slate-200 focus:bg-white transition-all"
                        />
                      </td>
                    )}

                    <td className="px-4 py-2 last:pr-6">
                      {(data.length > 1 || !isItemEmpty(item)) && (
                        <button
                          type="button"
                          onClick={() => setDeleteModal({ isOpen: true, index, isBulk: false })}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-200 hover:bg-rose-50 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDeleteModal 
        isOpen={deleteModal.isOpen}
        title={deleteModal.isBulk ? 'Xác nhận xóa nhiều' : 'Xác nhận xóa bản ghi'}
        message={deleteModal.isBulk 
          ? `Bạn có chắc chắn muốn xóa ${selectedIndices.size} mục đã chọn?` 
          : 'Bạn có chắc chắn muốn xóa bản ghi này?'}
        onClose={() => setDeleteModal({ isOpen: false, isBulk: false })}
        onConfirm={handleRemove}
      />
    </div>
  );
};

export default PromotionHistoryForm;
