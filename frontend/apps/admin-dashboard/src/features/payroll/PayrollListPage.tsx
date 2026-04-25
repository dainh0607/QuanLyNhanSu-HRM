import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "../../hooks/useToast";
import { payrollService } from '../../services/payrollService';
import type { PayrollGroup } from '../../services/payrollService';
import { PayrollTable } from './components/PayrollTable';
import PayrollCreateModal from './components/PayrollCreateModal';
import SalaryGradeManagement from '../enterprise-settings/payroll-settings/components/SalaryGradeManagement';

type PayrollView = 'payroll-list' | 'payroll-types' | 'salary-config';

const PAYROLL_TABS: { id: PayrollView; label: string; icon: string; desc: string }[] = [
  { id: 'payroll-list', label: 'Bảng lương', icon: 'receipt_long', desc: 'Quản lý bảng lương theo kỳ' },
  { id: 'payroll-types', label: 'Loại bảng lương', icon: 'category', desc: 'Thiết lập mẫu bảng lương' },
  { id: 'salary-config', label: 'Cấu hình tiền lương', icon: 'payments', desc: 'Bậc lương · Phụ cấp · Tạm ứng · Thu nhập' },
];

export const PayrollListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  const [activeView, setActiveView] = useState<PayrollView>('payroll-list');
  const [groups, setGroups] = useState<PayrollGroup[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

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
    if (activeView === 'payroll-list') {
      void loadPayrolls();
    }
  }, [loadPayrolls, activeView]);

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

  const handleTabClick = (tab: PayrollView) => {
    if (tab === 'payroll-types') {
      navigate('/payroll/types');
    } else {
      setActiveView(tab);
    }
  };

  return (
    <main className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-[30px] py-6 bg-[#f8fafc]">
      {ToastComponent}
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Tiền lương</h1>
          <p className="text-slate-500 mt-1 text-sm font-medium">Quản lý và tính toán tiền lương định kỳ cho nhân viên</p>
        </div>
        
        {activeView === 'payroll-list' && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="h-[42px] px-4 bg-[#134BBA] text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:bg-[#0e378c] active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tạo bảng lương
            </button>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-6 shrink-0 overflow-x-auto pb-1">
        {PAYROLL_TABS.map(tab => (
          <button 
            key={tab.id}
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all whitespace-nowrap border ${
              activeView === tab.id 
                ? 'bg-[#134BBA] text-white border-[#134BBA] shadow-md shadow-blue-200' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
            }`}
          >
            <span className={`material-symbols-outlined text-[20px] ${activeView === tab.id ? 'text-white' : 'text-slate-400'}`}>
              {tab.icon}
            </span>
            <div className="text-left">
              <div className="leading-tight">{tab.label}</div>
              <div className={`text-[10px] font-medium mt-0.5 ${activeView === tab.id ? 'text-blue-100' : 'text-slate-400'}`}>
                {tab.desc}
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* View Content */}
      {activeView === 'payroll-list' && (
        <>
          {/* Main Content Table Container */}
          <div 
            className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
            data-purpose="payroll-table-container"
          >
            <PayrollTable 
              groups={groups} 
              isLoading={isLoading}
              onDelete={(id) => setDeleteId(id)}
              onViewDetail={(id) => navigate(`/payroll/${id}`)}
            />
          </div>

          {/* Pagination Footer */}
          {!isLoading && total > 0 && (
            <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white shrink-0">
              <div className="text-sm text-slate-500 font-medium">
                Hiển thị <span className="text-slate-900 font-bold">{(currentPage - 1) * pageSize + 1}</span> - <span className="text-slate-900 font-bold">{Math.min(currentPage * pageSize, total)}</span> trong tổng số <span className="text-slate-900 font-bold">{total}</span> bảng lương
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_left</span>
                </button>
                
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-[13px] transition-all ${
                      currentPage === i + 1 
                        ? 'bg-[#134BBA] text-white shadow-md shadow-blue-100' 
                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {activeView === 'salary-config' && (
        <div className="flex-1 min-h-0 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col p-6">
          <SalaryGradeManagement />
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
                className="w-full py-3 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-all shadow-md hover:shadow-lg"
              >
                Xác nhận xóa
              </button>
              <button 
                onClick={() => setDeleteId(null)}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-200 transition-all"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      <PayrollCreateModal 
        isOpen={isCreateModalOpen} 
        onClose={() => setIsCreateModalOpen(false)} 
        onSuccess={loadPayrolls} 
      />

    </main>
  );
};
