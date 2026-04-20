import { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import type { PermissionItem } from '../../../../services/employee/types';

export interface PermissionFormRef {
  save: () => Promise<void>;
  reset: () => Promise<void>;
}

interface PermissionFormProps {
  mobilePermissions: PermissionItem[];
  webPermissions: PermissionItem[];
  onSaveMobile: (permissions: PermissionItem[]) => Promise<void>;
  onSaveWeb: (permissions: PermissionItem[]) => Promise<void>;
  onResetMobile: () => Promise<PermissionItem[]>;
  onIsDirtyChange: (isDirty: boolean) => void;
  onIsSubmittingChange: (isSubmitting: boolean) => void;
}

const PermissionForm = forwardRef<PermissionFormRef, PermissionFormProps>(({
  mobilePermissions,
  webPermissions,
  onSaveMobile,
  onSaveWeb,
  onResetMobile,
  onIsDirtyChange,
  onIsSubmittingChange
}, ref) => {
  const [activeSubTab, setActiveSubTab] = useState<'web' | 'mobile'>('mobile');
  const [localMobilePerms, setLocalMobilePerms] = useState<PermissionItem[]>(mobilePermissions);
  const [localWebPerms, setLocalWebPerms] = useState<PermissionItem[]>(webPermissions);
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);

  useEffect(() => {
    setLocalMobilePerms(mobilePermissions);
    setLocalWebPerms(webPermissions);
    setIsDirty(false);
    onIsDirtyChange(false);
  }, [mobilePermissions, webPermissions]);

  const updateDirty = (dirty: boolean) => {
    setIsDirty(dirty);
    onIsDirtyChange(dirty);
  };

  const handleToggleParent = (parentId: string) => {
    const nextPerms = localMobilePerms.map(p => {
      if (p.id === parentId) {
        return { ...p, isEnabled: !p.isEnabled };
      }
      return p;
    });
    setLocalMobilePerms(nextPerms);
    updateDirty(true);
  };

  const handleToggleChild = (parentId: string, childId: string) => {
    const nextPerms = localMobilePerms.map(p => {
      if (p.id === parentId && p.children) {
        return {
          ...p,
          children: p.children.map(c => 
            c.id === childId ? { ...c, isEnabled: !c.isEnabled } : c
          )
        };
      }
      return p;
    });
    setLocalMobilePerms(nextPerms);
    updateDirty(true);
  };

  const handleToggleWeb = (id: string) => {
    const nextPerms = localWebPerms.map(p => 
      p.id === id ? { ...p, isEnabled: !p.isEnabled } : p
    );
    setLocalWebPerms(nextPerms);
    updateDirty(true);
  };

  const handleSave = async () => {
    if (!isDirty || isSubmitting) return;
    setIsSubmitting(true);
    onIsSubmittingChange(true);
    try {
      if (activeSubTab === 'mobile') {
        await onSaveMobile(localMobilePerms);
      } else {
        await onSaveWeb(localWebPerms);
      }
      setIsDirty(false);
      onIsDirtyChange(false);
    } finally {
      setIsSubmitting(false);
      onIsSubmittingChange(false);
    }
  };

  const handleResetTrigger = async () => {
    setIsResetDialogOpen(true);
  };

  const confirmReset = async () => {
    setIsResetDialogOpen(false);
    setIsSubmitting(true);
    onIsSubmittingChange(true);
    try {
      const defaultPerms = await onResetMobile();
      setLocalMobilePerms(defaultPerms);
      updateDirty(true);
    } finally {
      setIsSubmitting(false);
      onIsSubmittingChange(false);
    }
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    save: handleSave,
    reset: handleResetTrigger
  }));

  const renderStatusButton = (isEnabled: boolean, onClick: () => void, disabled: boolean) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-9 px-5 rounded-lg text-[13px] font-bold transition-all border ${
        disabled 
        ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
        : isEnabled 
          ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 active:scale-95' 
          : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 active:scale-95'
      }`}
    >
      {isEnabled ? 'Truy cập' : 'Không'}
    </button>
  );

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-700 mt-2">
      {/* SUB-TABS (Moved to top as per requirement) */}
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

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeSubTab === 'mobile' ? (
          <div className="space-y-4 mb-10">
            {localMobilePerms.map(parent => (
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
                  
                  <button
                    onClick={() => handleToggleParent(parent.id)}
                    className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      parent.isEnabled ? 'bg-emerald-500' : 'bg-slate-200'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        parent.isEnabled ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {parent.isEnabled && parent.children && parent.children.length > 0 && (
                  <div className="p-6 pt-2 border-t border-slate-50 animate-in slide-in-from-top-4 duration-500">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                       {parent.children.map(child => (
                         <div key={child.id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100/50 group hover:border-emerald-100 hover:bg-white transition-all">
                            <div className="flex items-center gap-3">
                               <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                               <span className="text-[14px] font-bold text-slate-700">{child.label}</span>
                            </div>
                            {renderStatusButton(child.isEnabled, () => handleToggleChild(parent.id, child.id), !parent.isEnabled)}
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
          </div>
        ) : (
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm animate-in fade-in zoom-in-95 duration-500 mb-10">
             <div className="p-8 border-b border-slate-50 bg-slate-50/30">
                <h3 className="text-[16px] font-black text-slate-800 tracking-tight">Cấu hình Trang web</h3>
                <p className="text-[12px] text-slate-400 font-medium">Phân quyền các module trên phiên bản Desktop</p>
             </div>
             <div className="p-8 space-y-4">
                {localWebPerms.map(perm => (
                   <div key={perm.id} className="flex items-center justify-between p-5 rounded-2xl bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-emerald-100 transition-all group">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 group-hover:border-emerald-100 transition-colors">
                            <span className="material-symbols-outlined">{perm.id === 'dashboard' ? 'dashboard' : perm.id === 'hr' ? 'groups' : perm.id === 'payroll' ? 'payments' : 'settings'}</span>
                         </div>
                         <span className="text-[15px] font-bold text-slate-700">{perm.label}</span>
                      </div>
                      {renderStatusButton(perm.isEnabled, () => handleToggleWeb(perm.id), false)}
                   </div>
                ))}
             </div>
          </div>
        )}
      </div>

      {/* RESET CONFIRMATION DIALOG */}
      {isResetDialogOpen && (
        <div className="fixed inset-0 z-[1300] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="bg-white rounded-[32px] w-full max-w-[500px] shadow-2xl p-10 border border-slate-100 animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 flex items-center justify-center mb-6">
               <span className="material-symbols-outlined text-rose-500 text-[32px]">refresh</span>
            </div>
            <h3 className="text-[20px] font-black text-slate-900 leading-tight mb-3">Xác nhận đặt lại quyền?</h3>
            <p className="text-[14px] text-slate-500 font-medium leading-relaxed mb-8">
              Bạn có chắc chắn muốn đặt lại toàn bộ quyền truy cập điện thoại về cấu hình mặc định của hệ thống không?
            </p>
            <div className="flex items-center gap-3">
               <button 
                 onClick={() => setIsResetDialogOpen(false)}
                 className="flex-1 h-12 rounded-2xl font-bold text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
               >
                 Hủy bỏ
               </button>
               <button 
                 onClick={confirmReset}
                 className="flex-1 h-12 rounded-2xl font-bold text-white bg-rose-500 shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95"
               >
                 Xác nhận
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

PermissionForm.displayName = 'PermissionForm';

export default PermissionForm;
