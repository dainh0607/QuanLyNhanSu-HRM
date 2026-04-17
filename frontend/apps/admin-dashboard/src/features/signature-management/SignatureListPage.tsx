
import React from 'react';
import { authService } from '../../services/authService';
import SignatureTabContent from './components/SignatureTabContent';

export const SignatureManagementPage: React.FC = () => {
  const user = authService.getCurrentUser();
  // Using user ID as employee ID for personal management
  const employeeId = user?.employeeId || 0;
  const employeeName = user?.fullName || 'Cá nhân';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#f8fafc]">
      {/* Top Banner/Header */}
      <div className="bg-white border-b border-slate-100 flex-shrink-0">
        <div className="max-w-[1600px] mx-auto px-10 py-10">
          <div className="flex items-center gap-3 mb-2">
            <span className="material-symbols-outlined text-emerald-500 text-[28px] font-variation-fill">draw</span>
            <h1 className="text-[32px] font-black text-slate-900 tracking-tight">Quản lý chữ ký mẫu</h1>
          </div>
          <p className="text-slate-400 font-medium max-w-xl">
            Danh sách các chữ ký mẫu của bạn. Hãy thiết lập một chữ ký mặc định để sử dụng nhanh chóng cho các văn bản và hợp đồng điện tử.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-10">
        <div className="max-w-[1600px] mx-auto">
          <SignatureTabContent employeeId={employeeId} employeeName={employeeName} />
        </div>
      </div>
    </div>
  );
};
