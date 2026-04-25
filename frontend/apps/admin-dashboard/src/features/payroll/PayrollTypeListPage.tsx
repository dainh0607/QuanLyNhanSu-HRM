import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { payrollService, type PayrollType } from "../../services/payrollService";
import { useToast } from "../../hooks/useToast";
import PayrollTypeEditModal from "./components/PayrollTypeEditModal";

const PayrollTypeListPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast, ToastComponent } = useToast();
  
  const [items, setItems] = useState<PayrollType[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editingItem, setEditingItem] = useState<PayrollType | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const skip = (currentPage - 1) * pageSize;
      const response = await payrollService.getPayrollTypes(skip, pageSize);
      setItems(response.items || []);
      setTotal(response.totalCount || 0);
    } catch (error) {
      console.error("Failed to load payroll types:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, pageSize]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await payrollService.deletePayrollType(deleteId);
      showToast("Xóa loại bảng lương thành công", "success");
      setDeleteId(null);
      void loadData();
    } catch (error: any) {
      const msg = error.message || "Không thể xóa loại bảng lương";
      showToast(msg, "error");
      setDeleteId(null);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <main className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-[30px] py-6 bg-[#f8fafc]">
      {ToastComponent}
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate("/payroll")}
            className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-all shadow-sm"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Loại bảng lương</h1>
            <p className="text-slate-500 mt-0.5 text-sm font-medium">Cấu hình các mẫu bảng lương và quy tắc áp dụng</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative group">
            <button 
              onClick={() => navigate("/payroll/types/create")}
              className="h-[42px] px-4 bg-[#134BBA] text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:bg-[#0e378c] active:scale-95 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tạo mới
              <span className="material-symbols-outlined text-[18px] ml-1 border-l border-white/20 pl-1">expand_more</span>
            </button>
          </div>
          <button className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-gray-50 transition-all">
            <span className="material-symbols-outlined text-[22px]">settings</span>
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        <div className="flex-1 overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500 w-16">STT</th>
                <th className="px-6 py-3 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tên loại bảng lương</th>
                <th className="px-6 py-3 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Từ khóa đại diện</th>
                <th className="px-6 py-3 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Phòng ban áp dụng</th>
                <th className="px-6 py-3 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Vị trí áp dụng</th>
                <th className="px-6 py-3 border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={6} className="px-6 py-8"><div className="h-4 bg-gray-100 rounded w-full"></div></td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-slate-200">category</span>
                      </div>
                      <p className="text-slate-400 font-medium">Chưa có loại bảng lương nào được thiết lập</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4 text-[13px] text-gray-500">{(currentPage - 1) * pageSize + index + 1}</td>
                    <td className="px-6 py-4">
                      <button className="text-[13px] font-bold text-[#134BBA] hover:underline decoration-2 underline-offset-4">{item.name}</button>
                    </td>
                    <td className="px-6 py-4 text-[13px] font-semibold text-slate-700 uppercase">{item.code}</td>
                    <td className="px-6 py-4">
                      <div className="max-w-[150px] truncate text-[13px] text-gray-600 font-medium" title={item.applicableDepartments}>
                        {item.applicableDepartments || "---"}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-[150px] truncate text-[13px] text-gray-600 font-medium" title={item.applicableJobTitles}>
                        {item.applicableJobTitles || "---"}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right relative">
                      <div className="flex justify-end">
                        <div className="relative group/menu">
                          <button className="w-8 h-8 flex items-center justify-center rounded-lg text-[#134BBA] hover:bg-blue-50 transition-all">
                            <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                          </button>
                          {/* Dropdown Menu */}
                          <div className="invisible group-hover/menu:visible opacity-0 group-hover/menu:opacity-100 absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-gray-100 z-50 transition-all transform scale-95 group-hover/menu:scale-100 origin-top-right py-1">
                            <button 
                              onClick={() => {
                                setEditingItem(item);
                                setIsEditModalOpen(true);
                              }}
                              className="w-full px-4 py-2 text-left text-[13px] font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                              Sửa
                            </button>
                            <button 
                              onClick={() => setDeleteId(item.id)}
                              className="w-full px-4 py-2 text-left text-[13px] font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                            >
                              <span className="material-symbols-outlined text-[18px]">delete</span>
                              Xóa
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {!isLoading && total > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-white">
            <div className="text-sm text-slate-500 font-medium">
              Tổng <span className="text-slate-900 font-bold">{total}</span> kết quả.
            </div>
            
            <div className="flex items-center gap-2">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 disabled:opacity-40 hover:bg-gray-50"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_left</span>
              </button>
              
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg font-bold text-[13px] ${
                    currentPage === i + 1 
                      ? 'bg-[#134BBA] text-white shadow-md' 
                      : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-400 disabled:opacity-40 hover:bg-gray-50"
              >
                <span className="material-symbols-outlined text-[18px]">chevron_right</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setDeleteId(null)}></div>
          <div className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="material-symbols-outlined text-3xl text-red-500">warning</span>
            </div>
            <h3 className="text-xl font-bold text-slate-900 text-center mb-2">Xác nhận xóa?</h3>
            <p className="text-slate-500 text-center text-sm mb-8 leading-relaxed">
              Bạn có chắc chắn muốn xóa loại bảng lương này? Hành động này không thể hoàn tác nếu dữ liệu chưa được sử dụng.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleDelete}
                className="w-full py-3 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 shadow-md transition-all"
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

      {/* Edit Modal */}
      <PayrollTypeEditModal 
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingItem(null);
        }}
        onSuccess={loadData}
        payrollType={editingItem}
      />

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </main>
  );
};

export default PayrollTypeListPage;
