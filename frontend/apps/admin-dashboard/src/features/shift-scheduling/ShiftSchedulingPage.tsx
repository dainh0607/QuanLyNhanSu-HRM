import React, { useState } from "react";
import ShiftSchedulingConfigView from "./ShiftSchedulingConfigView";
import ShiftTaskListView from "./components/ShiftTaskListView";

const ShiftSchedulingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"config" | "work">("config");

  const subTabs = [
    { id: "config", label: "Cấu hình chung", icon: "settings" },
    { id: "work", label: "Công việc", icon: "calendar_today" },
  ];

  return (
    <div className="flex flex-col h-full w-full bg-slate-50/50 overflow-hidden">
      {/* Sub-tab Navigation */}
      <div className="bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-2xl">
          {subTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-white text-emerald-600 shadow-sm shadow-emerald-500/10"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Optional: Right side status/info */}
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
          Phân hệ Xếp ca & Lập lịch
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {activeTab === "config" ? (
          <ShiftSchedulingConfigView />
        ) : (
          <ShiftTaskListView />
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
      `}} />
    </div>
  );
};

export default ShiftSchedulingPage;
