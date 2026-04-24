import React, { useState, useEffect } from 'react';
import { payrollService, type SalaryGrade, type PaymentCycle, type PayrollVariable } from '../services/payrollService';
import { useToast } from '../../../../hooks/useToast';
import SalaryGradeFormModal from './SalaryGradeFormModal';
import PayrollVariableModal from './PayrollVariableModal';

type MainTab = 'grade' | 'allowance' | 'advance' | 'other';
const MAIN_TABS: { id: MainTab; label: string }[] = [
  { id: 'grade', label: 'Loại cấp bậc lương' },
  { id: 'allowance', label: 'Loại phụ cấp' },
  { id: 'advance', label: 'Loại tạm ứng' },
  { id: 'other', label: 'Thu nhập khác' },
];

const CYCLES: { id: PaymentCycle; label: string }[] = [
  { id: 'one-time', label: 'Chi trả một lần' },
  { id: 'hourly', label: 'Chi trả theo giờ' },
  { id: 'monthly', label: 'Chi trả theo tháng' },
  { id: 'daily', label: 'Chi trả theo ngày công' },
];

const SalaryGradeManagement: React.FC = () => {
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('grade');
  const [activeCycle, setActiveCycle] = useState<PaymentCycle>('monthly');
  const [data, setData] = useState<SalaryGrade[]>([]);
  const [variables, setVariables] = useState<PayrollVariable[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SalaryGrade | null>(null);
  const [selectedVariable, setSelectedVariable] = useState<PayrollVariable | null>(null);
  const { showToast, ToastComponent } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeMainTab === 'grade') {
        const result = await payrollService.getSalaryGrades(activeMainTab, activeCycle);
        setData(result);
      } else {
        const result = await payrollService.getVariables(activeMainTab as any);
        setVariables(result);
      }
    } catch (e) {
      showToast("Lỗi khi tải dữ liệu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeMainTab, activeCycle]);

  const handleCreate = () => {
    if (activeMainTab !== 'grade') {
      setSelectedVariable(null);
      setIsVariableModalOpen(true);
    } else {
      setSelectedItem(null);
      setIsModalOpen(true);
    }
  };

  const handleEdit = (item: any) => {
    if (activeMainTab !== 'grade') {
      setSelectedVariable(item);
      setIsVariableModalOpen(true);
    } else {
      setSelectedItem(item);
      setIsModalOpen(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa mục này?")) {
      let result;
      if (activeMainTab !== 'grade') {
        result = await payrollService.deleteVariable(id, activeMainTab);
      } else {
        result = await payrollService.deleteSalaryGrade(id);
      }
      
      if (result.success) {
        showToast("Xóa thành công", "success");
        fetchData();
      } else {
        showToast(result.message || "Lỗi khi xóa", "error");
      }
    }
  };

  // AC 2.2: Format tiền tệ
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  return (
    <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
      {ToastComponent}

      {/* AC 1.1: Main Sub-tabs (Level 1) */}
      <div className="flex items-center justify-between border-b border-slate-100 px-2 shrink-0">
        <div className="flex gap-8">
          {MAIN_TABS.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveMainTab(tab.id)}
              className={`py-3 text-[11px] font-black uppercase tracking-widest relative transition-all ${activeMainTab === tab.id ? 'text-[#192841]' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {tab.label}
              {activeMainTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#192841] rounded-full" />}
            </button>
          ))}
        </div>

        <button 
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#192841] text-white px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-[#111c2f] transition-all"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Tạo mới
        </button>
      </div>

      {/* AC 1.2: Segmented Buttons (Level 2) - Chỉ hiện khi ở tab Cấp bậc lương */}
      {activeMainTab === 'grade' && (
        <div className="flex justify-center shrink-0">
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
            {CYCLES.map(cycle => (
              <button
                key={cycle.id}
                onClick={() => setActiveCycle(cycle.id)}
                className={`px-6 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${activeCycle === cycle.id ? 'bg-white text-[#192841] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                {cycle.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Data Table Area */}
      <div className="flex-1 bg-white border border-slate-100 rounded-[32px] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#192841] border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Đang tải dữ liệu...</p>
          </div>
        ) : (activeMainTab === 'grade' && data.length === 0) || (activeMainTab !== 'grade' && variables.length === 0) ? (
          /* AC 2.3: Empty State */
          <div className="flex-1 flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 bg-slate-50 rounded-3xl flex items-center justify-center text-slate-200 mb-6">
              <span className="material-symbols-outlined text-[40px]">{activeMainTab !== 'grade' ? 'featured_play_list' : 'payments'}</span>
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Không có dữ liệu</h3>
            <p className="text-xs font-bold text-slate-400 mt-2">Chưa có {activeMainTab === 'grade' ? 'mức lương' : MAIN_TABS.find(t => t.id === activeMainTab)?.label.toLowerCase()} nào được thiết lập.</p>
            <button 
              onClick={handleCreate}
              className="mt-6 px-8 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              Thiết lập ngay
            </button>
          </div>
        ) : activeMainTab === 'grade' ? (
          /* AC 2.1: Salary Grade Table */
          <div className="flex-1 overflow-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">STT</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên {MAIN_TABS.find(t => t.id === activeMainTab)?.label}</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Số tiền (VND)</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {data.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-black text-[#192841]">{item.name}</div>
                    </td>
                    <td className="px-8 py-5">
                      {/* AC 2.2: Format tiền tệ */}
                      <div className="text-sm font-black text-emerald-600 bg-emerald-50 inline-block px-3 py-1 rounded-lg border border-emerald-100">
                        {formatCurrency(item.amount)} <span className="text-[10px] ml-1">₫</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                        <button 
                          onClick={() => handleEdit(item)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* AC 1.2: Variable Table View (Allowance, Advance, Other) */
          <div className="flex-1 overflow-auto custom-scrollbar">
             <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 sticky top-0 z-10 backdrop-blur-md">
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">STT</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tên {MAIN_TABS.find(t => t.id === activeMainTab)?.label}</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Từ khóa định danh (Keyword)</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-40 text-center">Thứ tự hiển thị</th>
                  <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-32">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {variables.map((item, idx) => {
                  const prefix = item.category === 'allowance' ? 'PHUCAP_' : item.category === 'advance' ? 'TAMUNG_' : 'HESOLUONG_';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 text-xs font-bold text-slate-400">{(idx + 1).toString().padStart(2, '0')}</td>
                      <td className="px-8 py-5">
                        <div className="text-sm font-black text-[#192841]">{item.name}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <span className="px-3 py-1 bg-slate-100 text-[10px] font-black text-slate-400 rounded-md border border-slate-200">{prefix}</span>
                          <div className={`text-sm font-black ${item.category === 'advance' ? 'text-red-500' : 'text-blue-600'}`}>{item.keyword.replace(prefix, '')}</div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="text-xs font-black text-slate-600 bg-slate-100 w-8 h-8 flex items-center justify-center rounded-lg mx-auto border border-slate-200">
                          {item.displayOrder}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button 
                            onClick={() => handleEdit(item)}
                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-blue-50 hover:text-blue-600 transition-all flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[18px]">edit</span>
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id)}
                            className="w-8 h-8 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all flex items-center justify-center"
                          >
                            <span className="material-symbols-outlined text-[18px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SalaryGradeFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={selectedItem}
        activeType={activeMainTab as any}
        activeCycle={activeCycle}
        onSuccess={fetchData}
      />

      <PayrollVariableModal 
        isOpen={isVariableModalOpen}
        onClose={() => setIsVariableModalOpen(false)}
        initialData={selectedVariable}
        category={activeMainTab as any}
        onSuccess={fetchData}
      />
    </div>
  );
};

export default SalaryGradeManagement;
