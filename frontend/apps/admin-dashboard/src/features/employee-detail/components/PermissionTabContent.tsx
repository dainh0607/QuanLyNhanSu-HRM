import React, { useState } from 'react';
import type { PermissionItem } from '../../../services/employee/types';

interface PermissionTabContentProps {
  mobilePermissions?: PermissionItem[];
  webPermissions?: PermissionItem[];
  isLoading: boolean;
  loadError: string | null;
}

const PermissionTabContent: React.FC<PermissionTabContentProps> = ({
  mobilePermissions = [],
  webPermissions = [],
  isLoading,
  loadError,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'web' | 'mobile'>('mobile');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-500"></div>
          <p className="text-sm font-bold text-slate-400">Đang tải phân quyền...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50/30 p-8 text-center">
        <span className="material-symbols-outlined text-red-400 text-[40px] mb-2">error</span>
        <p className="text-sm font-bold text-red-600">{loadError}</p>
      </div>
    );
  }

  const renderStatusBadge = (isEnabled: boolean) => (
    <div className={`px-4 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 ${
      isEnabled 
      ? 'bg-emerald-50 text-emerald-600' 
      : 'bg-rose-50 text-rose-600'
    }`}>
      {isEnabled 
        ? <span className="material-symbols-outlined text-[14px]">check_circle</span>
        : <span className="material-symbols-outlined text-[14px]">cancel</span>
      }
      {isEnabled ? 'Truy cập' : 'Không'}
    </div>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700 pb-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Phân quyền</h2>
          <p className="text-[14px] text-slate-400 font-medium mt-1">Xem chi tiết cấu hình quyền hạn cho nhân viên</p>
        </div>
      </div>

      <div className="flex items-center gap-1 p-1 bg-slate-100/50 rounded-2xl self-start mb-8 border border-slate-100">
        <button
          onClick={() => setActiveSubTab('web')}
          className={`h-10 px-6 rounded-xl flex items-center gap-2.5 transition-all text-[14px] font-bold ${
            activeSubTab === 'web' 
            ? 'bg-white text-emerald-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">language</span>
          Trang web
        </button>
        <button
          onClick={() => setActiveSubTab('mobile')}
          className={`h-10 px-6 rounded-xl flex items-center gap-2.5 transition-all text-[14px] font-bold ${
            activeSubTab === 'mobile' 
            ? 'bg-white text-emerald-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
          }`}
        >
          <span className="material-symbols-outlined text-[20px]">smartphone</span>
          Điện thoại
        </button>
      </div>

      <div className="flex-1">
        {activeSubTab === 'mobile' ? (
          <div className="space-y-4">
            {mobilePermissions.map(parent => (
              <div key={parent.id} className="bg-white rounded-[28px] border border-slate-100 overflow-hidden shadow-sm">
                <div className={`p-6 flex items-center justify-between transition-colors ${parent.isEnabled ? 'bg-slate-50/30' : 'bg-slate-50/10 opacity-70'}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${parent.isEnabled ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                      <span className="material-symbols-outlined text-[24px]">
                        {parent.id === 'notify' ? 'notifications' : 
                         parent.id === 'task' ? 'assignment' :
                         parent.id === 'work' ? 'business_center' :
                         parent.id === 'employee' ? 'badge' :
                         parent.id === 'calendar' ? 'event' :
                         parent.id === 'elearning' ? 'school' : 'more_horiz'}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-[16px] font-black text-slate-800 tracking-tight">{parent.label}</h3>
                      <p className="text-[12px] text-slate-400 font-medium">Quyền hạn trong Module {parent.label}</p>
                    </div>
                  </div>
                  
                  {renderStatusBadge(parent.isEnabled)}
                </div>

                {parent.isEnabled && parent.children && parent.children.length > 0 && (
                  <div className="p-6 pt-2 border-t border-slate-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                       {parent.children.map(child => (
                         <div key={child.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50">
                            <div className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                               <span className="text-[14px] font-bold text-slate-700">{child.label}</span>
                            </div>
                            {renderStatusBadge(child.isEnabled)}
                         </div>
                       ))}
                    </div>
                  </div>
                )}
                
                {!parent.isEnabled && (
                   <div className="px-6 py-4 bg-slate-50/30 text-[12px] text-slate-400 font-medium italic border-t border-slate-50">
                      Module này đã bị tắt. Tất cả tính năng bên trong sẽ không khả dụng.
                   </div>
                )}
              </div>
            ))}
            {mobilePermissions.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center text-slate-300 bg-white rounded-[32px] border border-slate-100">
                <span className="material-symbols-outlined text-[48px] mb-2 text-slate-200">security</span>
                <p className="font-bold text-sm">Chưa có thông tin phân quyền điện thoại</p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500">
             <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <h3 className="text-[16px] font-black text-slate-800 tracking-tight">Cấu hình Trang web</h3>
                <p className="text-[12px] text-slate-400 font-medium">Phân quyền các module trên phiên bản Desktop</p>
             </div>
             <div className="p-8 space-y-4">
                {webPermissions.map(perm => (
                   <div key={perm.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-emerald-100 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-colors">
                            <span className="material-symbols-outlined">{perm.id === 'dashboard' ? 'dashboard' : perm.id === 'hr' ? 'groups' : perm.id === 'payroll' ? 'payments' : 'settings'}</span>
                         </div>
                         <span className="text-[15px] font-bold text-slate-700">{perm.label}</span>
                      </div>
                      {renderStatusBadge(perm.isEnabled)}
                   </div>
                ))}
                {webPermissions.length === 0 && (
                  <div className="py-10 flex flex-col items-center justify-center text-slate-300">
                    <span className="material-symbols-outlined text-[48px] mb-2 text-slate-200">web</span>
                    <p className="font-bold text-sm">Chưa có thông tin phân quyền web</p>
                  </div>
                )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PermissionTabContent;
