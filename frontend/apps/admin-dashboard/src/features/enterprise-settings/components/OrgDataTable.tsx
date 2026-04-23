import React, { useState } from "react";

interface OrgDataTableProps {
  data: any[];
  typeLabel: string;
  type: "region" | "branch" | "department" | "jobTitle";
  onEdit: (item: any) => void;
  onDelete: (id: number) => void;
  onBulkDelete: (ids: number[]) => void;
  isLoading: boolean;
  // Extra data for lookups
  regions?: any[];
  branches?: any[];
  departments?: any[];
}

const OrgDataTable: React.FC<OrgDataTableProps> = ({
  data,
  typeLabel,
  type,
  onEdit,
  onDelete,
  onBulkDelete,
  isLoading,
  regions = [],
  branches = [],
  departments = []
}) => {
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [activeMenuId, setActiveMenuId] = useState<number | null>(null);

  const toggleSelectAll = () => {
    if (selectedIds.length === data.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(data.map(item => item.id));
    }
  };

  const toggleSelectRow = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const getParentBranchName = (parentId?: number) => {
    if (!parentId || !branches) return "---";
    const parent = branches.find(b => b.id === parentId);
    return parent ? parent.name : "---";
  };

  const getRegionName = (regionId?: number) => {
    if (!regionId || !regions) return "---";
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : "---";
  };

  const getParentDeptName = (parentId?: number) => {
    if (!parentId || !departments) return "---";
    const parent = departments.find(d => d.id === parentId);
    return parent ? parent.name : "---";
  };



  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-400 text-xs font-medium uppercase tracking-widest">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Table Action Bar */}
      <div className="h-14 flex items-center justify-between px-2 mb-2">
        <div className="flex items-center gap-4">
          <span className="text-[13px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full">
            Đang hiển thị {data.length}/{data.length} {typeLabel}
          </span>
          {selectedIds.length >= 2 && (
            <button
              onClick={() => {
                if (window.confirm(`Bạn có chắc chắn muốn xóa ${selectedIds.length} mục đã chọn?`)) {
                  onBulkDelete(selectedIds);
                  setSelectedIds([]);
                }
              }}
              className="px-4 py-1.5 bg-rose-50 text-rose-600 text-[12px] font-bold rounded-lg border border-rose-100 hover:bg-rose-100 transition-all flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">delete_sweep</span>
              Xóa ({selectedIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Table Content */}
      <div className={`overflow-x-auto custom-scrollbar ${data.length > 7 ? 'max-h-[500px] overflow-y-auto' : ''}`}>
        <table className="w-full border-separate border-spacing-y-0 text-left min-w-[1000px]">
          <thead className={`whitespace-nowrap ${data.length > 7 ? "sticky top-0 z-10" : ""}`}>
            <tr className={data.length > 7 ? "bg-slate-50" : "bg-slate-50/50"}>
              <th className="p-4 w-12 first:rounded-l-2xl border-b border-slate-100">
                <input
                  type="checkbox"
                  checked={data.length > 0 && selectedIds.length === data.length}
                  onChange={toggleSelectAll}
                  className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
              </th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-16 text-center">STT</th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-32">Mã</th>
              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Tên {typeLabel}</th>
              
              {type === 'branch' && (
                <>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Vùng</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Trực thuộc</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Số ĐT</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Địa chỉ</th>
                </>
              )}

              {type === 'department' && (
                <>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Chi nhánh</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Trực thuộc</th>
                </>
              )}

              {type === 'jobTitle' && (
                <>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Trình độ</th>
                  <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Kinh nghiệm</th>
                </>
              )}

              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">Ghi chú</th>
              
              {(type === 'branch' || type === 'department' || type === 'jobTitle') && (
                <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 w-24 text-center">Thứ tự</th>
              )}

              <th className="p-4 text-[11px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 last:rounded-r-2xl w-24 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="before:block before:h-2">
            {data.length === 0 ? (
              <tr>
                <td colSpan={type === 'branch' ? 10 : 6} className="py-20 text-center">
                  <div className="flex flex-col items-center opacity-30">
                    <span className="material-symbols-outlined text-4xl mb-2">folder_open</span>
                    <p className="text-xs font-bold uppercase tracking-widest">Danh sách trống</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, index) => (
                <tr 
                  key={item.id} 
                  className={`group transition-all hover:bg-emerald-50/20 whitespace-nowrap ${selectedIds.includes(item.id) ? 'bg-emerald-50/30' : ''}`}
                >
                  <td className="p-4 border-b border-slate-50 group-last:border-none">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelectRow(item.id)}
                      className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all"
                    />
                  </td>
                  <td className="p-4 border-b border-slate-50 group-last:border-none text-center">
                    <span className="text-[13px] font-bold text-slate-400">{index + 1}</span>
                  </td>
                  <td className="p-4 border-b border-slate-50 group-last:border-none">
                    <span className="text-[13px] font-black text-slate-700 font-mono tracking-tight">{item.code}</span>
                  </td>
                  <td className="p-4 border-b border-slate-50 group-last:border-none">
                    <div className="flex items-center gap-2.5">
                      <span className="text-[13px] font-bold text-slate-800">{item.name}</span>
                    </div>
                  </td>
                  
                  {type === 'branch' && (
                    <>
                      <td className="p-4 border-b border-slate-50 group-last:border-none">
                        <span className="text-[12px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">{getRegionName(item.regionId)}</span>
                      </td>
                      <td className="p-4 border-b border-slate-50 group-last:border-none">
                        <span className="text-[12px] font-medium text-slate-500 italic">{getParentBranchName(item.parentId)}</span>
                      </td>
                      <td className="p-4 border-b border-slate-50 group-last:border-none">
                        <span className="text-[13px] font-medium text-slate-600">{item.phone || "---"}</span>
                      </td>
                      <td className="p-4 border-b border-slate-50 group-last:border-none">
                        <span className="text-[12px] text-slate-500 font-medium">{item.address || "---"}</span>
                      </td>
                    </>
                  )}

                  {type === 'department' && (
                    <>
                      <td className="p-4 border-b border-slate-50 group-last:border-none">
                        <span className="text-[12px] font-bold text-slate-600">{getParentBranchName(item.branchId)}</span>
                      </td>
                      <td className="p-4 border-b border-slate-50 group-last:border-none">
                        <span className="text-[12px] font-medium text-slate-500 italic">{getParentDeptName(item.parentId)}</span>
                      </td>
                    </>
                  )}

                  {type === 'jobTitle' && (
                    <>
                      <td className="p-4 border-b border-slate-50 group-last:border-none">
                        <span className="text-[12px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md">{item.qualification || "---"}</span>
                      </td>
                      <td className="p-4 border-b border-slate-50 group-last:border-none">
                        <span className="text-[13px] font-medium text-slate-600">{item.experience || "---"}</span>
                      </td>
                    </>
                  )}

                  <td className="p-4 border-b border-slate-50 group-last:border-none">
                    <span className="text-[13px] text-slate-400 font-medium">{item.note || "---"}</span>
                  </td>

                  {(type === 'branch' || type === 'department' || type === 'jobTitle') && (
                    <td className="p-4 border-b border-slate-50 group-last:border-none text-center">
                      <span className="text-[13px] font-black text-slate-400 italic">#{item.displayOrder ?? 0}</span>
                    </td>
                  )}

                  <td className="p-4 border-b border-slate-50 group-last:border-none text-center relative">
                    <button 
                      onClick={() => setActiveMenuId(activeMenuId === item.id ? null : item.id)}
                      className="w-8 h-8 rounded-full inline-flex items-center justify-center text-slate-400 hover:bg-white hover:shadow-sm hover:text-emerald-600 transition-all border border-transparent"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_vert</span>
                    </button>

                    {activeMenuId === item.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setActiveMenuId(null)} />
                        <div className="absolute right-4 bottom-full mb-1 w-36 bg-white rounded-2xl shadow-2xl border border-slate-100 p-1.5 z-20 animate-[modalSlideUp_0.2s_ease-out]">
                          <button 
                            onClick={() => { onEdit(item); setActiveMenuId(null); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-bold text-slate-700 hover:bg-slate-50 transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px] text-slate-400">edit</span>
                            Chỉnh sửa
                          </button>
                          <button 
                            onClick={() => {
                              if (window.confirm(`Bạn có chắc chắn muốn xóa ${typeLabel} "${item.name}"?`)) {
                                onDelete(item.id);
                              }
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-bold text-rose-600 hover:bg-rose-50 transition-all"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                            Xóa
                          </button>
                        </div>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrgDataTable;
