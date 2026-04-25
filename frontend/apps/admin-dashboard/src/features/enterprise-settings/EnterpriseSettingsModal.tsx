import React, { useState } from "react";
import SettingsSidebar from "./SettingsSidebar";
import AccountSettingsView from "./AccountSettingsView";
import EnterpriseOrgView from "./EnterpriseOrgView";
import EnterpriseBrandingView from "./EnterpriseBrandingView";
import EnterpriseRBACView from "./EnterpriseRBACView";
import EmployeeCategoriesView from "./EmployeeCategoriesView";
import { ShiftSchedulingPage } from "../shift-scheduling";
import RequestTemplatesListView from "./request-templates/components/RequestTemplatesListView";
import LeaveManagementView from "./leave-management/components/LeaveManagementView";
import HolidayManagement from "./leave-management/components/HolidayManagement";
import SalaryGradeManagement from "./payroll-settings/components/SalaryGradeManagement";
import ContractManagement from "./contract-management/components/ContractManagement";
import TimesheetSettings from "./timesheet-settings/components/TimesheetSettings";

interface EnterpriseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialModule?: string;
}

const EnterpriseSettingsModal: React.FC<EnterpriseSettingsModalProps> = ({ isOpen, onClose, initialModule = "personal" }) => {
  const [activeModule, setActiveModule] = useState(initialModule);
  const [isDirty, setIsDirty] = useState(false);
  const [saveTriggered, setSaveTriggered] = useState(0);

  // Sync activeModule with initialModule when modal opens
  React.useEffect(() => {
    if (isOpen && initialModule) {
      setActiveModule(initialModule);
    }
  }, [isOpen, initialModule]);

  if (!isOpen) return null;

  const handleSaveClick = () => {
    setSaveTriggered(prev => prev + 1);
  };

  const handleClose = () => {
    if (isDirty) {
      if (window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn đóng không?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const getModuleTitle = () => {
    switch (activeModule) {
      case 'personal': return 'Tài khoản cá nhân';
      case 'account': return 'Doanh nghiệp';
      case 'branding': return 'Thương hiệu & Tên miền';
      case 'employees': return 'Nhân viên';
      case 'rbac': return 'Phân quyền & Vai trò';
      case 'attendance': return 'Chấm công';
      case 'shifts': return 'Xếp ca';
      case 'leave-management': return 'Nghỉ phép';
      case 'holiday-management': return 'Nghỉ lễ';
      case 'timesheet-settings': return 'Chấm công';
      case 'payroll-settings': return 'Tiền lương';
      case 'contract-settings': return 'Hợp đồng';
      case 'request-templates': return 'Yêu cầu';
      default: return 'Cài đặt';
    }
  };

  const getModuleDescription = () => {
    switch (activeModule) {
      case 'personal': return 'Quản lý thông tin pháp lý, ngân hàng và cấu hình cá nhân';
      case 'account': return 'Quản lý cấu trúc tổ chức: Vùng, Chi nhánh, Phòng ban';
      case 'branding': return 'Tùy chỉnh Logo, màu sắc chủ đề và tên miền truy cập riêng';
      case 'employees': return 'Quản lý danh mục và trường dữ liệu nhân sự';
      case 'rbac': return 'Phân quyền & Vai trò';
      case 'shifts': return 'Cấu hình luồng nghiệp vụ và quy tắc xếp ca';
      case 'leave-management': return 'Thiết lập loại ngày nghỉ, quy tắc cộng dồn và số dư phép';
      case 'holiday-management': return 'Thiết lập lịch nghỉ lễ, đối tượng áp dụng và hệ số lương';
      case 'timesheet-settings': return 'Cấu hình phương thức chấm công và định nghĩa ngày công chuẩn';
      case 'payroll-settings': return 'Quản lý thang bảng lương, phụ cấp và các loại thu nhập chuẩn';
      case 'contract-settings': return 'Thiết lập loại hợp đồng, biểu mẫu mẫu và thông báo';
      case 'request-templates': return 'Quản lý mẫu đơn và thiết kế yêu cầu';
      default: return '';
    }
  };

  return (
    <div className="fixed inset-0 z-[1000] bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center p-4 lg:p-8 animate-[backdropFadeIn_0.3s_ease-out] font-inter">
      <div className="bg-white w-full max-w-[1440px] h-full max-h-[860px] rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.2)] flex flex-col overflow-hidden animate-[modalSlideUp_0.4s_cubic-bezier(0.16,1,0.3,1)]">
        {/* Modal Header */}
        <header className="h-12 border-b border-slate-100 flex items-center justify-between px-6 bg-white shrink-0">
          <span className="text-sm font-bold text-slate-800 tracking-tight uppercase">Cài đặt hệ thống</span>
          <button 
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </header>

        {/* Main Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Sidebar */}
          <aside className="w-[260px] flex-shrink-0 bg-[#f8fafc]/80 border-r border-slate-100">
            <SettingsSidebar 
              activeModule={activeModule} 
              onModuleChange={setActiveModule} 
            />
          </aside>

          {/* Right Content View */}
          <main className="flex-1 bg-white overflow-hidden flex flex-col">
            {/* View Header */}
            <div className="h-16 px-8 border-b border-slate-50 flex items-center justify-between shrink-0">
              <div>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {getModuleTitle()}
                </h3>
                <p className="text-[12px] text-slate-400 font-medium">{getModuleDescription()}</p>
              </div>
              <div className="flex items-center gap-4">
                {activeModule === 'request-templates' && (
                  <button 
                    onClick={() => window.dispatchEvent(new CustomEvent('trigger-create-request-template'))}
                    className="flex items-center gap-2 bg-emerald-500 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-100 hover:bg-emerald-600 hover:-translate-y-0.5 transition-all"
                  >
                    <span className="material-symbols-outlined text-[18px]">add</span>
                    Tạo mới
                  </button>
                )}
                <button
                  onClick={handleSaveClick}
                  disabled={!isDirty}
                  className={`px-8 py-2 rounded-full text-xs font-bold transition-all shadow-md ${
                    isDirty 
                      ? "bg-[#134BBA] text-white shadow-blue-100 hover:bg-[#0f41a8] hover:-translate-y-0.5" 
                      : "bg-slate-100 text-slate-300 cursor-not-allowed shadow-none"
                  }`}
                >
                  Lưu
                </button>
              </div>
            </div>

            {/* View Content */}
            <div className="flex-1 overflow-hidden custom-scrollbar flex flex-col">
              {['shifts', 'leave-management', 'holiday-management', 'timesheet-settings', 'payroll-settings', 'contract-settings', 'request-templates'].includes(activeModule) ? (
                 <div className="flex-1 flex flex-col overflow-hidden p-8">
                   {activeModule === 'shifts' && <ShiftSchedulingPage />}
                   {activeModule === 'leave-management' && <LeaveManagementView />}
                   {activeModule === 'holiday-management' && <HolidayManagement />}
                   {activeModule === 'timesheet-settings' && <TimesheetSettings />}
                   {activeModule === 'payroll-settings' && <SalaryGradeManagement />}
                   {activeModule === 'contract-settings' && <ContractManagement />}
                   {activeModule === 'request-templates' && <RequestTemplatesListView />}
                 </div>
              ) : (
                <div className="max-w-full mx-auto px-8 py-8 w-full">
                  {/* Module Mapping */}
                  {activeModule === 'personal' && (
                    <AccountSettingsView 
                      onDirtyChange={setIsDirty}
                      saveTriggered={saveTriggered}
                      onSaveComplete={() => setIsDirty(false)}
                    />
                  )}

                  {activeModule === 'account' && (
                    <EnterpriseOrgView />
                  )}

                  {activeModule === 'branding' && (
                    <EnterpriseBrandingView 
                      onDirtyChange={setIsDirty}
                      saveTriggered={saveTriggered}
                      onSaveComplete={() => setIsDirty(false)}
                    />
                  )}

                  {activeModule === 'employees' && (
                    <EmployeeCategoriesView />
                  )}

                  {activeModule === 'rbac' && (
                    <EnterpriseRBACView 
                      onDirtyChange={setIsDirty}
                      saveTriggered={saveTriggered}
                      onSaveComplete={() => setIsDirty(false)}
                    />
                  )}
                  
                  {/* Chỉ hiện thông báo đang phát triển cho các module chưa làm */}
                  {!['personal', 'account', 'branding', 'employees', 'rbac', 'shifts', 'request-templates'].includes(activeModule) && (
                    <div className="flex flex-col items-center justify-center h-full py-32 text-center">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                        <span className="material-symbols-outlined text-3xl text-slate-200">construction</span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900">Tính năng đang phát triển</h4>
                      <p className="text-slate-400 max-w-xs mt-2 text-sm font-medium">Phân hệ {getModuleTitle()} hiện đang được xây dựng.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes modalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}} />
    </div>
  );
};

export default EnterpriseSettingsModal;
