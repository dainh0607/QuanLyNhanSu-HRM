import React, { useState, useEffect, useCallback } from 'react';
import { employeeProfileService } from '../../../services/employeeService';
import type { EmployeePromotionHistoryProfile, EmployeePromotionHistoryFilters } from '../../../services/employee/types';
import { formatDate, formatCurrency, displayValue } from '../utils';
import Pagination from '../../employees/components/Pagination';
import ConfirmDeleteModal from './ConfirmDeleteModal';
import EmptyState from './EmptyState';

interface PromotionHistoryTableProps {
  employeeId: number;
  visibleColumns: string[];
  paginationEnabled: boolean;
}

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

const PromotionHistoryTable: React.FC<PromotionHistoryTableProps> = ({
  employeeId,
  visibleColumns,
  paginationEnabled,
}) => {
  const [data, setData] = useState<EmployeePromotionHistoryProfile[]>([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  
  // Modal state
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id?: number; isBulk: boolean }>({
    isOpen: false,
    isBulk: false
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const filters: EmployeePromotionHistoryFilters = {
        pageNumber: currentPage,
        pageSize: paginationEnabled ? pageSize : 100, // Load all if paging disabled
        searchTerm: searchTerm || undefined
      };
      const response = await employeeProfileService.getPromotionHistoryList(employeeId, filters);
      setData(response.items);
      setTotalRecords(response.totalCount);
    } catch (error) {
      console.error('Failed to fetch promotion history:', error);
    } finally {
      setLoading(false);
    }
  }, [employeeId, currentPage, pageSize, searchTerm, paginationEnabled]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const toggleSelectAll = () => {
    if (selectedIds.size === data.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(data.map(item => item.id)));
    }
  };

  const toggleSelectRow = (id: number) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      if (deleteModal.isBulk) {
        await employeeProfileService.bulkDeletePromotionHistory(employeeId, Array.from(selectedIds));
        setSelectedIds(new Set());
      } else if (deleteModal.id) {
        await employeeProfileService.deletePromotionHistory(employeeId, deleteModal.id);
        const next = new Set(selectedIds);
        next.delete(deleteModal.id);
        setSelectedIds(next);
      }
      await fetchHistory();
      setDeleteModal({ isOpen: false, isBulk: false });
    } catch (error) {
      console.error('Delete failed:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const showBulkDelete = selectedIds.size >= 2;

  return (
    <div className="space-y-4">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <span className="text-xs font-bold text-slate-400">
             Đang hiển thị {data.length}/{totalRecords}
           </span>
           <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[18px] group-hover:text-emerald-500 transition-colors">search</span>
              <input 
                type="text"
                placeholder="Tìm quyết định/chức danh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-9 w-64 rounded-xl bg-slate-50 pl-10 pr-4 text-[12px] font-medium text-slate-600 outline-none border border-transparent focus:border-emerald-200 focus:bg-white transition-all shadow-sm"
              />
           </div>
           
           {/* Nút Xóa Nhiều (T266) */}
           {showBulkDelete && (
             <button 
               onClick={() => setDeleteModal({ isOpen: true, isBulk: true })}
               className="flex items-center gap-2 rounded-xl bg-red-50 px-4 py-2 text-xs font-bold text-red-500 transition-all hover:bg-red-100 animate-in fade-in slide-in-from-left-2 duration-300 shadow-sm border border-red-100"
             >
               <span className="material-symbols-outlined text-[18px]">delete</span>
               Xóa {selectedIds.size} mục đã chọn
             </button>
           )}
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm relative group/table">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
             <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-emerald-500" />
          </div>
        )}
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50/80">
                <th className="px-4 py-4 first:pl-8 w-10">
                   <button 
                     onClick={toggleSelectAll}
                     className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all duration-200 
                       ${selectedIds.size === data.length && data.length > 0 
                         ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                         : 'bg-white border-slate-200 hover:border-emerald-300'}`}
                   >
                     {selectedIds.size === data.length && data.length > 0 && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                   </button>
                </th>
                {PROMOTION_COLUMNS.filter(c => visibleColumns.includes(c.id)).map((col) => (
                  <th key={col.id} className="whitespace-nowrap px-4 py-4 text-left text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    {col.label}
                  </th>
                ))}
                <th className="px-4 py-4 last:pr-8 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.length === 0 ? (
                <tr>
                  <td colSpan={visibleColumns.length + 2}>
                    <EmptyState message={loading ? 'Đang tải...' : 'Không tìm thấy lịch sử thăng tiến'} />
                  </td>
                </tr>
              ) : (
                data.map((p) => (
                  <tr 
                    key={p.id} 
                    className={`group transition-all hover:bg-slate-50/80 ${selectedIds.has(p.id) ? 'bg-emerald-50/30' : ''}`}
                  >
                    <td className="px-4 py-4 first:pl-8">
                       <button 
                         onClick={() => toggleSelectRow(p.id)}
                         className={`flex h-5 w-5 items-center justify-center rounded-lg border-2 transition-all duration-200 
                           ${selectedIds.has(p.id) 
                             ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20' 
                             : 'bg-white border-slate-200 hover:border-emerald-300 group-hover:border-slate-300'}`}
                       >
                         {selectedIds.has(p.id) && <span className="material-symbols-outlined text-[14px] font-bold">check</span>}
                       </button>
                    </td>
                    {visibleColumns.includes('effectiveDate') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-slate-600">{formatDate(p.effectiveDate)}</td>
                    )}
                    {visibleColumns.includes('decisionType') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">
                         <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-700 transition-colors">
                           {displayValue(p.decisionType)}
                         </span>
                      </td>
                    )}
                    {visibleColumns.includes('contractType') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.contractType)}</td>
                    )}
                    {visibleColumns.includes('documentNumber') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-mono font-medium text-slate-900">{displayValue(p.decisionNumber)}</td>
                    )}
                    {visibleColumns.includes('jobStatus') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.workStatus)}</td>
                    )}
                    {visibleColumns.includes('city') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-400">-</td>
                    )}
                    {visibleColumns.includes('district') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-400">-</td>
                    )}
                    {visibleColumns.includes('branch') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.branchName)}</td>
                    )}
                    {visibleColumns.includes('department') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.departmentName)}</td>
                    )}
                    {visibleColumns.includes('jobTitle') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-semibold text-slate-900">{displayValue(p.jobTitleName)}</td>
                    )}
                    {visibleColumns.includes('paymentMethod') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.paymentMethod)}</td>
                    )}
                    {visibleColumns.includes('salaryLevelName') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-600">{displayValue(p.salaryGrade)}</td>
                    )}
                    {visibleColumns.includes('salaryAmount') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-bold text-emerald-600">{formatCurrency(p.salaryAmount)}</td>
                    )}
                    {visibleColumns.includes('allowance') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-emerald-600">
                        {p.allowance ? (
                          <button className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm">Xem chi tiết</button>
                        ) : '-'}
                      </td>
                    )}
                    {visibleColumns.includes('otherIncome') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-emerald-600">
                         <button className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-600 hover:bg-emerald-100 transition-colors shadow-sm">Xem chi tiết</button>
                      </td>
                    )}
                    {visibleColumns.includes('note') && (
                      <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-500 max-w-[200px] truncate">{displayValue(p.note)}</td>
                    )}
                    <td className="whitespace-nowrap px-4 py-4 text-right last:pr-8">
                       <div className="flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => setDeleteModal({ isOpen: true, id: p.id, isBulk: false })}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all"
                          >
                             <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination UI (T269) */}
        {paginationEnabled && totalRecords > pageSize && (
          <div className="border-t border-slate-100">
            <Pagination 
              totalRecords={totalRecords}
              currentPage={currentPage}
              recordsPerPage={pageSize}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      <ConfirmDeleteModal 
        isOpen={deleteModal.isOpen}
        isDeleting={isDeleting}
        title={deleteModal.isBulk ? 'Xóa nhiều mục' : 'Xác nhận xóa bản ghi'}
        message={deleteModal.isBulk 
          ? `Bạn có chắc chắn muốn xóa ${selectedIds.size} lịch sử thăng tiến đã chọn?` 
          : 'Bạn có chắc chắn muốn xóa bản ghi lịch sử thăng tiến này?'}
        onClose={() => setDeleteModal({ isOpen: false, isBulk: false })}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default PromotionHistoryTable;
