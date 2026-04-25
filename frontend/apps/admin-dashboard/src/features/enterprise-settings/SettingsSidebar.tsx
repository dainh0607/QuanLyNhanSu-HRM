import React from "react";

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  badge?: string;
  disabled?: boolean;
}

interface SettingsSidebarProps {
  activeModule: string;
  onModuleChange: (id: string) => void;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ activeModule, onModuleChange }) => {
  const menuItems: MenuItem[] = [
    { id: "personal", label: "Tài khoản cá nhân", icon: "person" },
    { id: "account", label: "Doanh nghiệp", icon: "business" },
    { id: "branding", label: "Thương hiệu", icon: "palette" },
    { id: "employees", label: "Nhân viên", icon: "badge" },
    { id: "rbac", label: "Phân quyền & Vai trò", icon: "shield_person" },
    { id: "timesheet-settings", label: "Chấm công", icon: "schedule" },
    { id: "shifts", label: "Xếp ca", icon: "calendar_view_week" },
    { id: "leave-management", label: "Nghỉ phép", icon: "event_available" },
    { id: "holiday-management", label: "Nghỉ lễ", icon: "holiday_village" },
    { id: "payroll-settings", label: "Tiền lương", icon: "payments" },
    { id: "contract-settings", label: "Hợp đồng", icon: "history_edu" },
    { id: "request-templates", label: "Yêu cầu", icon: "description" },
  ];

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]/50 p-4">
      <nav className="space-y-1 flex-1">
        {menuItems.map((item) => {
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => !item.disabled && onModuleChange(item.id)}
              disabled={item.disabled}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200 group relative ${
                isActive 
                  ? "bg-white text-emerald-600 shadow-sm ring-1 ring-slate-100" 
                  : item.disabled 
                    ? "opacity-30 cursor-not-allowed" 
                    : "text-slate-500 hover:bg-white hover:text-emerald-600"
              }`}
            >
              <div className="flex items-center gap-3">
                {isActive && (
                  <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-emerald-500 rounded-r-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                )}
                <span className={`material-symbols-outlined text-[20px] transition-transform duration-200 ${isActive ? 'scale-105' : 'group-hover:scale-105'}`}>
                  {item.icon}
                </span>
                <span className="text-[13px] font-bold tracking-tight">{item.label}</span>
              </div>
              {item.disabled && (
                <span className="text-[9px] bg-slate-100 text-slate-400 px-1 py-0.5 rounded uppercase font-bold tracking-wider">Soon</span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto px-2 py-4">
        <div className="bg-slate-900 rounded-2xl p-4 text-white shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-emerald-400 text-[18px]">verified</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">Enterprise</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-relaxed font-medium">Phiên bản chuyên nghiệp dành cho doanh nghiệp lớn.</p>
        </div>
      </div>
    </div>
  );
};

export default SettingsSidebar;
