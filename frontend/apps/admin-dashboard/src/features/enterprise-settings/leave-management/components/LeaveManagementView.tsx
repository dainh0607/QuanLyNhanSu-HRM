import React, { useState, useEffect } from 'react';
import { leaveService, type LeaveType } from '../services/leaveService';
import { useToast } from '../../../../hooks/useToast';
import LeaveTypeFormModal from './LeaveTypeFormModal';
import ImportBalanceModal from './ImportBalanceModal';
import EmployeeLeaveTracker from './EmployeeLeaveTracker';

type TabKey = 'leave-types' | 'accrual-rules' | 'settings';

const LeaveManagementView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabKey>('leave-types');
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<LeaveType | null>(null);
  const { showToast, ToastComponent } = useToast();

  // Settings State
  const [calcMethod, setCalcMethod] = useState('leave_days');
  const [hiddenLeaveDurations, setHiddenLeaveDurations] = useState<string[]>([]);
  const durationOptions = ['1/16 ngày', '1/8 ngày', '1/4 ngày', '1/2 ngày', '3/4 ngày', 'Trong ngày', 'Nhiều ngày', 'Theo giờ'];

  const toggleDuration = (val: string) => {
    if (hiddenLeaveDurations.includes(val)) {
      setHiddenLeaveDurations(hiddenLeaveDurations.filter(d => d !== val));
    } else {
      setHiddenLeaveDurations([...hiddenLeaveDurations, val]);
    }
  };

  const handleSaveSettings = () => {
    // Mock API call
    setTimeout(() => {
      showToast("Cập nhật thiết lập nghỉ phép thành công", "success");
    }, 500);
  };

  const fetchLeaveTypes = async () => {
    setIsLoading(true);
    try {
      const data = await leaveService.getLeaveTypes();
      setLeaveTypes(data);
    } catch (e) {
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveTypes();
  }, []);

  const handleEdit = (type: LeaveType) => {
    setSelectedType(type);
    setIsFormModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedType(null);
    setIsFormModalOpen(true);
  };

  const filteredData = leaveTypes.filter(lt => 
    statusFilter === 'active' ? lt.isActive : !lt.isActive
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white overflow-hidden animate-in fade-in duration-500">
      {ToastComponent}
      
      {/* Tabs Header (AC 1.1) */}
      <div className="px-8 border-b border-slate-50 flex items-center gap-8 shrink-0 bg-white z-10">
        <button 
          onClick={() => setActiveTab('leave-types')}
          className={`py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'leave-types' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Loại ngày nghỉ
          {activeTab === 'leave-types' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('accrual-rules')}
          className={`py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'accrual-rules' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Thiết lập nghỉ phép
          {activeTab === 'accrual-rules' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`py-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === 'settings' ? 'text-emerald-500' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Nghỉ phép theo nhân viên
          {activeTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500 rounded-full" />}
        </button>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 ${activeTab === 'settings' ? 'flex flex-col overflow-hidden' : 'overflow-y-auto'} custom-scrollbar p-8 space-y-6`}>
        {activeTab === 'leave-types' && (
          <>
            {/* Toolbar */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Status Filter (AC 1.2) */}
                <div className="relative group">
                   <select 
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="appearance-none bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-slate-600 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all cursor-pointer"
                   >
                     <option value="active">Đang hoạt động</option>
                     <option value="inactive">Đã ngừng</option>
                   </select>
                   <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-[18px]">expand_more</span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center gap-2 bg-white border border-slate-200 text-slate-600 px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">upload_file</span>
                  Nhập file
                </button>
                <button 
                  onClick={handleCreate}
                  className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all"
                >
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Tạo mới
                </button>
              </div>
            </div>

            {/* Table (AC 1.3) */}
            <div className="bg-white border border-slate-100 rounded-[24px] overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 border-b border-slate-100">
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">STT</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Từ khóa</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên ngày nghỉ</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Loại nghỉ</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Thứ tự</th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic text-xs">Đang tải dữ liệu...</td>
                    </tr>
                  ) : filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200">
                            <span className="material-symbols-outlined text-[32px]">inventory_2</span>
                          </div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Chưa có dữ liệu</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((lt, idx) => (
                      <tr key={lt.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-6 py-4 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-black font-mono">{lt.keyword}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-bold text-slate-800">{lt.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-xs font-bold text-slate-500">{lt.category === 'annual' ? 'Nghỉ phép năm' : 'Nghỉ ốm/Khác'}</span>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-slate-500">{lt.displayOrder}</td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button 
                              onClick={() => handleEdit(lt)}
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-emerald-50 hover:text-emerald-500 transition-all flex items-center justify-center"
                            >
                              <span className="material-symbols-outlined text-[18px]">edit</span>
                            </button>
                            <button 
                              className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
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
          </>
        )}

        {activeTab === 'accrual-rules' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Cấu hình chung</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">Định nghĩa cách hệ thống tính công và hiển thị loại thời gian nghỉ.</p>
              </div>
              <div className="p-6 space-y-6">
                
                {/* AC 2.1: Hình thức tính công nghỉ phép */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Hình thức tính công nghỉ phép</label>
                  <p className="text-[11px] text-slate-500">Thiết lập này quyết định cách phân hệ Chấm công ghi nhận ngày phép.</p>
                  <select 
                    value={calcMethod}
                    onChange={(e) => setCalcMethod(e.target.value)}
                    className="w-full max-w-md bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all appearance-none"
                  >
                    <option value="leave_days">Công nghỉ phép theo ngày phép</option>
                    <option value="work_days">Công nghỉ phép theo ngày công</option>
                  </select>
                </div>

                {/* AC 2.2: Ẩn các loại nghỉ phép */}
                <div className="space-y-2 pt-4 border-t border-slate-50">
                  <label className="text-sm font-bold text-slate-700">Ẩn các mốc thời gian nghỉ</label>
                  <p className="text-[11px] text-slate-500">Những mốc thời gian được chọn dưới đây sẽ KHÔNG hiển thị trong form Đơn xin nghỉ phép của nhân viên.</p>
                  
                  <div className="flex flex-wrap gap-2 pt-2">
                    {durationOptions.map(opt => {
                      const isHidden = hiddenLeaveDurations.includes(opt);
                      return (
                        <button
                          key={opt}
                          onClick={() => toggleDuration(opt)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            isHidden 
                              ? 'bg-rose-50 border-rose-200 text-rose-600' 
                              : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                          }`}
                        >
                          {opt}
                          {isHidden && <span className="material-symbols-outlined text-[14px]">close</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
              
              {/* AC 3.1 & 3.2: Nút cập nhật */}
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                  onClick={handleSaveSettings}
                  className="px-8 py-2.5 rounded-xl text-sm font-black uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 shadow-lg shadow-emerald-100 hover:-translate-y-0.5 transition-all"
                >
                  Cập nhật
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <EmployeeLeaveTracker />
        )}
      </div>

      {/* Modals */}
      <LeaveTypeFormModal 
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSuccess={fetchLeaveTypes}
        initialData={selectedType}
      />
      <ImportBalanceModal 
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchLeaveTypes}
      />
    </div>
  );
};

export default LeaveManagementView;
