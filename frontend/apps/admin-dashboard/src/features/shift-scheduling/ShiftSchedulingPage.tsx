import React, { useState } from "react";
import WeeklyShiftSchedulePage from "./WeeklyShiftSchedulePage";
import ShiftSchedulingConfigView from "./ShiftSchedulingConfigView";

const ShiftSchedulingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"config" | "work">("config");

  return (
    <div className="flex flex-col h-full overflow-hidden bg-slate-50/50">
      {/* Premium Tabs Header */}
      <div className="bg-white border-b border-slate-200 px-8 shrink-0 shadow-sm z-10">
        <div className="flex items-center h-16 gap-10">
          <button
            onClick={() => setActiveTab("config")}
            className={`h-full px-2 border-b-2 transition-all duration-300 text-sm font-black flex items-center gap-2.5 relative group ${
              activeTab === "config"
                ? "border-[#134BBA] text-[#134BBA]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${activeTab === "config" ? "scale-110" : "group-hover:scale-110"}`}>
              settings_applications
            </span>
            Cấu hình chung
            {activeTab === "config" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134BBA] rounded-full animate-in fade-in zoom-in-x duration-300"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("work")}
            className={`h-full px-2 border-b-2 transition-all duration-300 text-sm font-black flex items-center gap-2.5 relative group ${
              activeTab === "work"
                ? "border-[#134BBA] text-[#134BBA]"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            <span className={`material-symbols-outlined text-[22px] transition-transform duration-300 ${activeTab === "work" ? "scale-110" : "group-hover:scale-110"}`}>
              event_upcoming
            </span>
            Công việc
            {activeTab === "work" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#134BBA] rounded-full animate-in fade-in zoom-in-x duration-300"></span>
            )}
          </button>
        </div>
      </div>

      {/* Tab Content Area */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="min-h-full">
          {activeTab === "config" ? (
            <ShiftSchedulingConfigView />
          ) : (
            <WeeklyShiftSchedulePage />
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftSchedulingPage;

