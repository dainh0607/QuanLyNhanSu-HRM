import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "../../hooks/useToast";

const PayrollSettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { ToastComponent } = useToast();
  const [activeTab, setActiveTab] = useState("rewards");

  return (
    <main className="relative flex h-[calc(100vh-64px)] w-full flex-col overflow-hidden px-[30px] py-6 bg-[#f8fafc]">
      {ToastComponent}
      
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <button onClick={() => navigate("/payroll")} className="hover:text-[#134BBA] transition-colors">Tiền lương</button>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="text-slate-900">Cấu hình danh mục</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Thiết lập dữ liệu nguồn</h1>
        </div>

        <button 
          onClick={() => navigate("/payroll")}
          className="h-[40px] px-4 rounded-lg border border-[#192841] bg-white text-[#192841] text-sm font-semibold hover:bg-[#192841]/5 transition-colors flex items-center gap-2 shadow-sm"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          Quay lại
        </button>
      </div>

      <div className="flex-1 flex flex-col min-h-0 gap-6">
        {/* Segmented Tabs Control */}
        <div className="flex items-center justify-center">
          <div className="flex p-1 bg-white rounded-lg shadow-sm border border-gray-200 w-fit">
            {[
              { id: "rewards", label: "Phần thưởng", icon: "military_tech" },
              { id: "meals", label: "Khẩu phần ăn", icon: "restaurant" },
              { id: "advances", label: "Tạm ứng & Hoàn ứng", icon: "payments" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2 rounded-md text-[13px] font-bold transition-all ${
                  activeTab === tab.id 
                    ? "bg-[#134BBA] text-white shadow-md" 
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area Table Container */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col animate-[tabSlideIn_0.3s_ease-out]">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">
                {activeTab === 'rewards' ? 'Danh mục phần thưởng' : activeTab === 'meals' ? 'Danh mục suất ăn' : 'Loại tạm ứng - hoàn ứng'}
              </h3>
              <p className="text-[12px] text-slate-400 font-medium mt-0.5">Quản lý từ khóa định danh và quy tắc áp dụng cho bảng lương.</p>
            </div>
            <button className="h-[42px] px-4 bg-[#134BBA] text-white rounded-lg font-bold text-sm shadow-md hover:shadow-lg hover:bg-[#0e378c] active:scale-95 transition-all flex items-center gap-2">
              <span className="material-symbols-outlined text-[20px]">add</span>
              Tạo mới
            </button>
          </div>

          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-left border-separate border-spacing-0">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-[24px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">STT</th>
                  <th className="px-[24px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Tên danh mục</th>
                  <th className="px-[24px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500">Từ khóa định danh</th>
                  <th className="px-[24px] py-[11px] border-b border-gray-200 text-[11px] font-semibold uppercase tracking-wider text-gray-500 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td colSpan={4} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <span className="material-symbols-outlined text-3xl text-slate-200">folder_open</span>
                      </div>
                      <p className="text-slate-400 font-medium">Hiện tại chưa có dữ liệu cấu hình cho mục này</p>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes tabSlideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </main>
  );
};

export default PayrollSettingsPage;
