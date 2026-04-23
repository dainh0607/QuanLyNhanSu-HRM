import React, { useState, useEffect } from "react";
import { settingsService, type AccessGroup } from "../../services/settingsService";

interface EnterpriseRBACViewProps {
  onDirtyChange?: (isDirty: boolean) => void;
  saveTriggered?: number;
  onSaveComplete?: () => void;
}

const EnterpriseRBACView: React.FC<EnterpriseRBACViewProps> = ({
  onDirtyChange,
  saveTriggered = 0,
  onSaveComplete
}) => {
  const [activeTab, setActiveTab] = useState<"groups" | "permissions">("groups");
  const [groups, setGroups] = useState<AccessGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Permissions Matrix State
  const [activeModuleId, setActiveModuleId] = useState("hr");
  const [matrix, setMatrix] = useState<any[]>([]);
  const [initialMatrix, setInitialMatrix] = useState<any[]>([]);
  const [isMatrixLoading, setIsMatrixLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const modules = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'hr', name: 'Nhân sự (HR)' },
    { id: 'attendance', name: 'Chấm công' },
    { id: 'payroll', name: 'Tiền lương' },
    { id: 'recruitment', name: 'Tuyển dụng' },
  ];

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await settingsService.getAccessGroups();
        setGroups(data);
      } catch (e) {
        console.error("Failed to fetch access groups", e);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    const fetchMatrix = async () => {
      setIsMatrixLoading(true);
      try {
        const data = await settingsService.getPermissions(activeModuleId);
        setMatrix(data);
        setInitialMatrix(JSON.parse(JSON.stringify(data)));
      } catch (e) {
        console.error("Failed to fetch permissions matrix", e);
      } finally {
        setIsMatrixLoading(false);
      }
    };
    if (activeTab === "permissions") {
      fetchMatrix();
    }
  }, [activeTab, activeModuleId]);

  useEffect(() => {
    if (activeTab === "permissions") {
      const isDirty = JSON.stringify(matrix) !== JSON.stringify(initialMatrix);
      onDirtyChange?.(isDirty);
    } else {
      onDirtyChange?.(false);
    }
  }, [matrix, initialMatrix, activeTab, onDirtyChange]);

  useEffect(() => {
    if (saveTriggered > 0 && activeTab === "permissions") {
      handleSave();
    }
  }, [saveTriggered]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await settingsService.updatePermissions(activeModuleId, matrix);
      setInitialMatrix(JSON.parse(JSON.stringify(matrix)));
      onSaveComplete?.();
    } catch (e) {
      alert("Lỗi khi lưu phân quyền");
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (rowIndex: number, groupId: string) => {
    if (groupId === 'admin') return; // Ràng buộc Admin
    const newMatrix = [...matrix];
    newMatrix[rowIndex] = {
      ...newMatrix[rowIndex],
      [groupId]: !newMatrix[rowIndex][groupId]
    };
    setMatrix(newMatrix);
  };

  const handleModuleChange = (moduleId: string) => {
    const isDirty = JSON.stringify(matrix) !== JSON.stringify(initialMatrix);
    if (isDirty) {
      if (window.confirm("Bạn có thay đổi chưa lưu. Bạn có muốn lưu lại trước khi chuyển sang Module khác không?")) {
        handleSave().then(() => setActiveModuleId(moduleId));
        return;
      }
    }
    setActiveModuleId(moduleId);
  };

  const filteredGroups = groups.filter(g => 
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    g.scope.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Sub-tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-100 px-2 mb-6">
        <div className="flex items-center gap-8">
          {[
            { key: "groups", label: "Nhóm truy cập" },
            { key: "permissions", label: "Phân quyền" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                const isDirty = JSON.stringify(matrix) !== JSON.stringify(initialMatrix);
                if (isDirty && activeTab === "permissions") {
                  if (window.confirm("Bạn có thay đổi chưa lưu. Bạn có chắc muốn rời đi?")) {
                    setActiveTab(tab.key as any);
                  }
                } else {
                  setActiveTab(tab.key as any);
                }
              }}
              className={`pb-3 text-[13px] font-bold transition-all relative whitespace-nowrap ${
                activeTab === tab.key 
                  ? "text-emerald-600 after:content-[''] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-emerald-500 after:rounded-full" 
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "groups" && (
          <div className="mb-2 relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">search</span>
            <input 
              type="text" 
              placeholder="Tìm kiếm nhóm quyền..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:bg-white transition-all w-64"
            />
          </div>
        )}

        {activeTab === "permissions" && (
          <div className="mb-2 flex items-center gap-3">
            <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Chọn mô-đun:</span>
            <select 
              value={activeModuleId}
              onChange={(e) => handleModuleChange(e.target.value)}
              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/10"
            >
              {modules.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeTab === "groups" ? (
        <div className="space-y-4">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-400 text-xs font-medium uppercase tracking-widest">Đang tải danh sách...</p>
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="py-20 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
              <span className="material-symbols-outlined text-4xl text-slate-200 mb-2">search_off</span>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Không tìm thấy nhóm quyền phù hợp</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredGroups.map((group) => (
                <div 
                  key={group.id} 
                  className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-emerald-100 transition-all group"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[22px]">group</span>
                      </div>
                      <div>
                        <h5 className="text-[14px] font-bold text-slate-900">{group.name}</h5>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded uppercase tracking-wider">Hệ thống</span>
                          <span className="text-[10px] font-medium text-slate-400 italic">Mặc định & Cố định</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">visibility</span>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Phạm vi dữ liệu</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {group.scope}
                      </p>
                    </div>
                    <div className="bg-slate-50/50 rounded-xl p-4 border border-slate-50">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">verified_user</span>
                        <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Quyền hạn chính</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                        {group.permissions}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Permissions Matrix Table */
        <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-separate border-spacing-y-0 text-left min-w-[800px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 sticky left-0 bg-slate-50/50 z-10 w-64">Tính năng / Hành động</th>
                  {groups.map(group => (
                    <th key={group.id} className="p-5 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 text-center min-w-[120px]">
                      {group.name.split('(')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isMatrixLoading ? (
                  <tr>
                    <td colSpan={groups.length + 1} className="py-20 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  matrix.map((row, rowIndex) => (
                    <tr key={row.featureId} className="hover:bg-slate-50/30 transition-colors">
                      <td className="p-5 border-b border-slate-50 sticky left-0 bg-white z-10">
                        <span className="text-[13px] font-bold text-slate-700">{row.featureName}</span>
                      </td>
                      {groups.map(group => (
                        <td key={group.id} className="p-5 border-b border-slate-50 text-center">
                          <button
                            onClick={() => handleToggle(rowIndex, group.id)}
                            disabled={group.id === 'admin'}
                            className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                              row[group.id] 
                                ? "bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200" 
                                : "bg-rose-50 text-rose-600 ring-1 ring-rose-200"
                            } ${group.id === 'admin' ? "opacity-50 cursor-not-allowed" : "hover:scale-105 active:scale-95"}`}
                          >
                            {row[group.id] ? "Truy cập" : "Không"}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isSaving && (
        <div className="fixed inset-0 z-[2000] bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-xs font-bold text-slate-600 uppercase tracking-widest">Đang cập nhật phân quyền...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnterpriseRBACView;
