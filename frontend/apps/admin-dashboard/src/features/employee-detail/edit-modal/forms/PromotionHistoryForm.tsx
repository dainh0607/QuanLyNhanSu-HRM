import React from 'react';
import type {
  EmployeeEditPromotionHistoryItemPayload,
  EmployeeEditPromotionHistoryPayload,
} from '../../../../services/employeeService';
import { DatePickerInput } from '../components/FormPrimitives';
import EmptyState from '../../components/EmptyState';

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

// Helper to check if an item is completely empty (ignoring id)
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
  const [visibleColumns, setVisibleColumns] = React.useState<string[]>(PROMOTION_COLUMNS.map(c => c.id));
  const [paginationEnabled, setPaginationEnabled] = React.useState(false);

  // Logic to handle updates and auto-append
  const updateItem = (index: number, patch: Partial<EmployeeEditPromotionHistoryItemPayload>) => {
    const updatedItems = [...data];
    updatedItems[index] = { ...updatedItems[index], ...patch };

    // If the updated item is the last one and it's no longer empty, add a new blank row
    const lastItem = updatedItems[updatedItems.length - 1];
    if (!isItemEmpty(lastItem)) {
      updatedItems.push(createEmptyPromotionItem());
    }

    onChange(updatedItems);
  };

  const handleRemove = (index: number) => {
    const filtered = data.filter((_, itemIndex) => itemIndex !== index);
    onChange(filtered);
  };

  const getItemError = (index: number, field: keyof EmployeeEditPromotionHistoryItemPayload): string | undefined =>
    errors[`promotionHistory.${index}.${field}`];

  const toggleColumn = (id: string) => {
    setVisibleColumns(prev => 
      prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
    );
  };

  return (
    <div className="relative">
      {/* SIDEBAR TÙY CHỈNH (giữ nguyên) */}
      {isSettingsOpen && (
        <>
          <div 
            className="fixed inset-0 z-[60] bg-slate-900/10 backdrop-blur-[2px]" 
            onClick={() => setIsSettingsOpen(false)}
          />
          <div className="fixed right-0 top-0 z-[70] h-full w-[360px] animate-in slide-in-from-right duration-300 border-l border-slate-200 bg-white shadow-2xl">
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-slate-100 p-6">
                <h3 className="text-lg font-black text-slate-900">Tùy chỉnh cột</h3>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">Cột hiển thị</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400 uppercase">Phân trang</span>
                    <button 
                      onClick={() => setPaginationEnabled(!paginationEnabled)}
                      className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors ${paginationEnabled ? 'bg-emerald-500' : 'bg-slate-200'}`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${paginationEnabled ? 'translate-x-5.5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {PROMOTION_COLUMNS.map((col) => (
                    <div 
                      key={col.id}
                      className="flex items-center justify-between rounded-xl bg-slate-50/50 p-4 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-[18px] text-slate-300">drag_indicator</span>
                        <span className="text-sm font-medium text-slate-700">{col.label}</span>
                      </div>
                      <button 
                        onClick={() => toggleColumn(col.id)}
                        className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer items-center rounded-full transition-colors ${visibleColumns.includes(col.id) ? 'bg-emerald-500' : 'bg-slate-200'}`}
                      >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${visibleColumns.includes(col.id) ? 'translate-x-5.5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* HEADER MỚI THEO HÌNH 3 */}
      <div className="mb-8 flex items-center gap-4 border-l-[6px] border-emerald-500 pl-4 py-1">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Lịch sử thăng tiến</h2>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Đang hiển thị {data.length}/{data.length}</span>
           <div className="relative">
              <select className="h-9 rounded-xl bg-slate-100/50 border-none px-4 text-[11px] font-bold text-slate-500 outline-none hover:bg-slate-100 transition-colors cursor-pointer">
                <option>Lọc trường thay đổi</option>
              </select>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <button className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2 text-[11px] font-bold text-emerald-600 transition-all hover:bg-emerald-50 shadow-sm">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Xuất file
           </button>
           <button 
              onClick={() => setIsSettingsOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100/50 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-900"
           >
              <span className="material-symbols-outlined text-[20px]">menu</span>
           </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm ring-1 ring-slate-900/5">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-4 py-5 first:pl-10 w-12 text-center">
                   <div className="flex justify-center items-center h-5 w-5 border-2 border-slate-200 rounded-lg bg-white"></div>
                </th>
                {PROMOTION_COLUMNS.filter(c => visibleColumns.includes(c.id)).map((col) => (
                  <th 
                    key={col.id} 
                    className="whitespace-nowrap px-4 py-5 text-left text-[11px] font-black uppercase tracking-wider text-slate-400"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-5 last:pr-6 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2} className="py-24">
                    <EmptyState 
                      message="Không có dữ liệu"
                      onAdd={() => onChange([createEmptyPromotionItem()])}
                    />
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr key={index} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-4 py-3 first:pl-10 text-center">
                       <div className="flex justify-center items-center h-5 w-5 border-2 border-slate-100 rounded-lg group-hover:border-emerald-200 transition-colors"></div>
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

                    {visibleColumns.includes('decisionType') && (
                      <td className="px-4 py-2 min-w-[220px]">
                        <input
                          type="text"
                          value={item.decisionType}
                          onChange={(e) => updateItem(index, { decisionType: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('contractType') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.contractType}
                          onChange={(e) => updateItem(index, { contractType: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('documentNumber') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.documentNumber}
                          onChange={(e) => updateItem(index, { documentNumber: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-mono font-black text-slate-900 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all uppercase tracking-tighter"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('jobStatus') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.jobStatus}
                          onChange={(e) => updateItem(index, { jobStatus: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('city') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.city}
                          onChange={(e) => updateItem(index, { city: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('district') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.district}
                          onChange={(e) => updateItem(index, { district: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('branch') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.branch}
                          onChange={(e) => updateItem(index, { branch: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('department') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.department}
                          onChange={(e) => updateItem(index, { department: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('jobTitle') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.jobTitle}
                          onChange={(e) => updateItem(index, { jobTitle: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] font-black text-slate-900 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('paymentMethod') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.paymentMethod}
                          onChange={(e) => updateItem(index, { paymentMethod: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    {visibleColumns.includes('salaryLevelName') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <input
                          type="text"
                          value={item.salaryLevelName}
                          onChange={(e) => updateItem(index, { salaryLevelName: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
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
                            className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 pr-10 text-[13px] font-black text-emerald-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">VNĐ</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('allowance') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.allowance}
                            onChange={(e) => updateItem(index, { allowance: e.target.value.replace(/\D/g, '') })}
                            className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 pr-10 text-[13px] font-black text-emerald-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">VNĐ</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('otherIncome') && (
                      <td className="px-4 py-2 min-w-[170px]">
                        <div className="relative">
                          <input
                            type="text"
                            value={item.otherIncome}
                            onChange={(e) => updateItem(index, { otherIncome: e.target.value.replace(/\D/g, '') })}
                            className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 pr-10 text-[13px] font-black text-emerald-600 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-black text-slate-400">VNĐ</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('note') && (
                      <td className="px-4 py-2 min-w-[300px]">
                        <input
                          type="text"
                          value={item.note}
                          onChange={(e) => updateItem(index, { note: e.target.value })}
                          className="h-10 w-full rounded-xl border-transparent bg-transparent px-3 text-[13px] text-slate-500 hover:bg-white hover:border-slate-200 focus:bg-white focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500 transition-all"
                        />
                      </td>
                    )}

                    <td className="px-4 py-2 last:pr-6">
                      {(data.length > 1 || !isItemEmpty(item)) && (
                        <button
                          type="button"
                          onClick={() => handleRemove(index)}
                          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-200 hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-95"
                        >
                          <span className="material-symbols-outlined text-[20px]">delete_sweep</span>
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
    </div>
  );
};

export default PromotionHistoryForm;
