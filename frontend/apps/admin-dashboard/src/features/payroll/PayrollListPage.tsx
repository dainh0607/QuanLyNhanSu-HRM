import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { payrollService } from '../../services/payrollService';
import type { PayrollGroup } from '../../services/payrollService';
import { PayrollTable } from './components/PayrollTable';

export const PayrollListPage: React.FC = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState<PayrollGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadPayrolls = useCallback(async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * pageSize;
      const response = await payrollService.getPayrolls(skip, pageSize);
      setGroups(response.data);
      setTotal(response.total);
    } catch (error) {
      console.error('Failed to load payrolls:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    void loadPayrolls();
  }, [loadPayrolls]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await payrollService.deletePayroll(deleteId);
      setDeleteId(null);
      void loadPayrolls();
      showToast('Xóa bảng lương thành công', 'success');
    } catch (error: any) {
      console.error('Failed to delete payroll:', error);
      const errorMsg = error.response?.data?.Message || error.message || 'Không thể xóa bảng lương. Có lỗi xảy ra.';
      showToast(errorMsg, 'error');
      setDeleteId(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc] p-8">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tiền lương</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Quản lý và tính toán tiền lương định kỳ cho nhân viên</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/payroll/types')} // AC 1.3
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all shadow-sm group"
            title="Loại bảng lương (Master Data)"
          >
            <span className="material-symbols-outlined text-[24px] group-hover:scale-110 transition-transform">
              payments
            </span>
          </button>
          
          <button 
            className="h-11 px-6 bg-[#134BBA] text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100 hover:bg-[#0f3f9f] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            Tạo bảng lương
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0">
        <PayrollTable 
          groups={groups} 
          onDelete={(id) => setDeleteId(id)} 
          isLoading={isLoading} 
        />
      </div>

      {/* Pagination Footer */}
      {!isLoading && total > 0 && (
        <div className="mt-8 flex items-center justify-between px-2">
          <div className="text-sm text-slate-500 font-medium">
            Hiển thị <span className="text-slate-900 font-bold">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-slate-900 font-bold">{Math.min(currentPage * pageSize, total)}</span> trong tổng số <span className="text-slate-900 font-bold">{total}</span> bảng lương
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-10 h-10 flex items-center justify-center rounded-xl font-bold text-sm transition-all ${
                  currentPage === i + 1 
                    ? 'bg-[#134BBA] text-white shadow-lg shadow-blue-100' 
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition-all"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setDeleteId(null)}></div>
          <div className="relative w-full max-w-md bg-white rounded-[28px] p-8 shadow-2xl border border-white animate-in zoom-in duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-red-500">delete_forever</span>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Xác nhận xóa bảng lương?</h3>
            <p className="text-slate-500 text-center text-sm leading-relaxed mb-8">
              Hành động này sẽ xóa vĩnh viễn bảng lương và dữ liệu tính lương liên quan. Bạn không thể hoàn tác sau khi thực hiện.
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete}
                className="w-full py-3.5 bg-red-500 text-white rounded-2xl font-bold hover:bg-red-600 transition-all shadow-lg shadow-red-100"
              >
                Xác nhận xóa
              </button>
              <button 
                onClick={() => setDeleteId(null)}
                className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-2xl font-bold hover:bg-slate-200 transition-all"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[2000] px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
        }`}>
          <span className="material-symbols-outlined text-[24px]">
            {toast.type === 'success' ? 'check_circle' : 'error'}
          </span>
          <span className="font-bold">{toast.message}</span>
        </div>
      )}
    </div>
  );
};
